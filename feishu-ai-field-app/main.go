package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	larkproject "github.com/larksuite/project-oapi-sdk-golang"
)

const (
	// 替换为你的真实 Plugin ID 和 Plugin Secret
	PluginID     = "YOUR_PLUGIN_ID"
	PluginSecret = "YOUR_PLUGIN_SECRET"

	// 飞书项目 API 域名，默认国内环境为 https://project.feishu.cn，若为私有化部署请修改为对应的域名
	ProjectAPIHost = "https://project.feishu.cn"
)

// 全局 SDK Client
var client *larkproject.Client

func main() {
	// 1. 初始化飞书项目 Go SDK
	// 默认使用国内环境，若为私有化部署或海外环境，可通过 larkproject.WithOpenBaseUrl 覆盖默认域名
	client = larkproject.NewClient(PluginID, PluginSecret)

	// 2. 注册 Webhook 路由
	// 飞书项目 AI 字段事件会推送到这个地址
	http.HandleFunc("/webhook/feishu/ai_field", handleAIFieldWebhook)

	// 3. 启动服务
	port := "8000"
	log.Printf("Starting server on port %s...\n", port)
	log.Printf("Webhook URL: http://localhost:%s/webhook/feishu/ai_field\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// handleAIFieldWebhook 接收飞书项目推送的 AI 字段事件
// 支持处理：8101（AI 字段生成请求），8102（AI 字段重新生成请求）
func handleAIFieldWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	data, ok := payload["data"].(map[string]interface{})
	if !ok {
		// 返回成功，忽略非预期格式数据
		respondJSON(w, 0, "success")
		return
	}

	eventType := int(data["event_type"].(float64))
	if eventType != 8101 && eventType != 8102 {
		// 不是 AI 字段事件，忽略
		respondJSON(w, 0, "ignored")
		return
	}

	aiEntity, ok := data["field_ai_entity"].(map[string]interface{})
	if !ok {
		respondJSON(w, 0, "no field_ai_entity")
		return
	}

	userInfo, ok := data["user_info"].(map[string]interface{})
	var userKey string
	if ok {
		if u, exists := userInfo["user_key"].(string); exists {
			userKey = u
		}
	}

	// 提取回写结果必备的 task_id 以及目标 AI 字段信息
	taskID := aiEntity["task_id"].(string)
	fieldKey, _ := aiEntity["field_key"].(string)
	fieldName, _ := aiEntity["field_name"].(string)
	fieldType, _ := aiEntity["field_type"].(string)

	// 提取管理员配置的上下文与 Prompt 属性
	// 飞书的 Webhook 结构：
	// aiEntity["reference_changed"] 是一个 map，key 是被引用的飞书字段名，value 是它的 before/after 变更情况
	// aiEntity["custom_property"] 是一个 array，里面包含了管理员配置的自定义属性列表
	referenceChanged := aiEntity["reference_changed"]
	customProperty := aiEntity["custom_property"]

	// 异步处理，避免阻塞 Webhook 导致超时重试
	// 注意：飞书项目要求 Webhook 响应时间必须在 3 秒以内
	go processAndCallback(taskID, userKey, fieldKey, fieldName, fieldType, referenceChanged, customProperty)

	// 立即返回 200 OK，通知飞书项目已收到事件
	respondJSON(w, 0, "success")
}

// processAndCallback 异步进行大模型推理并将结果写回飞书项目
func processAndCallback(taskID, userKey, fieldKey, fieldName, fieldType string, referenceChanged, customProperty interface{}) {
	ctx := context.Background()

	log.Printf("Processing AI Task: %s\n", taskID)
	log.Printf("Target AI Field: key=%s, name=%s, type=%s", fieldKey, fieldName, fieldType)

	// 官方文档明确说明：/open_api/ai_application_field/update 不支持附件类型（multi_file）
	if fieldType == "multi_file" || fieldType == "multi-file" {
		log.Printf("Skip update: AI field %s(%s) is unsupported type %s. Please change the AI field output type to link_cloud_doc, text, multi_text, link, etc.", fieldName, fieldKey, fieldType)
		return
	}

	// 1. 从 payload 中提取“参考 PRD”的内容以及“写作要求”Prompt
	prdContent := extractPRDContent(referenceChanged)
	prompt := extractPrompt(customProperty)

	// 如果没有获取到内容，只保留 PRD 的兜底文案；Prompt 不再使用工程内预设值
	if prdContent == "" {
		prdContent = "未提取到需求文档内容"
	}
	if prompt == "" {
		log.Printf("No admin prompt found in custom_property; sending empty prompt to Coze")
	}

	log.Printf("Extracted Prompt: %s", prompt)
	log.Printf("Extracted PRD Content (preview): %s...", truncateString(prdContent, 50))
	log.Printf("Prompt sent to Coze: %s", prompt)

	// 2. 调用真实的 Coze (扣子) API
	// TODO: 填入你的 Coze Personal Access Token (PAT) 和 Bot ID
	cozeToken := "YOUR_COZE_PAT_TOKEN"
	cozeBotID := "YOUR_COZE_BOT_ID"

	llmResult := callCozeAPI(cozeToken, cozeBotID, prompt, prdContent)
	if llmResult == "" {
		llmResult = fmt.Sprintf("AI 生成失败，请检查 Coze 接口配置。处理时间: %s", time.Now().Format(time.RFC3339))
	}

	// 3. 获取 Plugin Token
	// 第二个参数 type=0 表示获取 plugin_access_token
	tokenResp, err := client.Plugin.GetPluginToken(ctx, 0)
	if err != nil {
		log.Printf("Failed to get plugin token: %v\n", err)
		return
	}
	if !tokenResp.Success() {
		log.Printf("Get plugin token API returned error: %v\n", tokenResp.Error)
		return
	}
	pluginToken := tokenResp.Data.Token

	// 4. 回写结果给飞书项目
	// 目前 SDK (v1.0.24) 尚未内置 AI 字段的 Update 方法封装，我们使用标准的 HTTP 请求调用该 Open API
	err = updateFeishuAIField(pluginToken, taskID, userKey, llmResult)
	if err != nil {
		log.Printf("Failed to update AI field: %v\n", err)
	} else {
		log.Printf("Successfully updated AI field for Task: %s\n", taskID)
	}
}

// updateFeishuAIField 通过 Open API 更新 AI 字段结果
func updateFeishuAIField(token, taskID, userKey, generatedContent string) error {
	url := ProjectAPIHost + "/open_api/ai_application_field/update"

	// 这里接收到的是从 Coze 回复中提取出来的纯链接。
	// 从最新报错看，目标字段在转换阶段要求的是 string，而不是数组：
	// "value is not string"
	// 所以这里直接把纯 URL 字符串传给 field_value，不再包装成 ["..."]。
	cloudDocURL := strings.TrimSpace(generatedContent)
	// 按当前联调要求：保留外层双引号，但不要在链接前后加反引号。
	formattedFieldValue := fmt.Sprintf("\"%s\"", cloudDocURL)

	reqBody := map[string]interface{}{
		"ai_task_id":  taskID,
		"field_value": formattedFieldValue,
	}
	jsonBody, _ := json.Marshal(reqBody)

	// 分别打印 Go 字符串字面量和值，确认引号和反引号都在
	log.Printf("field_value(Go literal): %q", formattedFieldValue)
	log.Printf("field_value(raw): %s", formattedFieldValue)
	// 把最终发给飞书 /update 接口的完整 JSON 打印出来
	log.Printf("准备发送给飞书的入参 (reqBody): %s", string(jsonBody))

	req, err := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}

	// 注入请求头
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Plugin-Token", token) // 使用 plugin_access_token 鉴权
	// 如果用户没有操作界面（比如自动化场景），或者没拿到 userKey，必须给个默认能代表插件或超级管理员身份的 User Key，否则飞书报错 20039
	if userKey == "" {
		userKey = "YOUR_USER_KEY" // 这里替换为你自己的或者默认测试账号的 User Key，如果你不知道自己的 User Key，可以在控制台打印出来
	}
	req.Header.Set("X-USER-KEY", userKey) // 回写操作往往需要以用户身份进行，因此传入用户 Key

	httpClient := &http.Client{Timeout: 10 * time.Second}
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP status %d: %s", resp.StatusCode, string(respBody))
	}

	// 进一步可以解析返回结果，检查 err_code 是否为 0
	log.Printf("Callback Response: %s\n", string(respBody))
	return nil
}

// extractPRDContent 从 reference_changed 中专门提取名为 "wiki" 或 包含 "wiki/需求文档" 的字段作为需求内容
func extractPRDContent(referenceChanged interface{}) string {
	if referenceChanged == nil {
		return ""
	}
	refMap, ok := referenceChanged.(map[string]interface{})
	if !ok {
		return ""
	}

	var contentBuilder strings.Builder
	for fieldKey, val := range refMap {
		fieldObj, ok := val.(map[string]interface{})
		if !ok {
			continue
		}
		// 优先取 after 变更后的值，如果是初始计算，也会有 after
		after, ok := fieldObj["after"].(map[string]interface{})
		if ok {
			// 如果你明确指定了需求文档是 wiki 字段，我们可以加一层过滤，
			// 确保我们发给大模型的内容是纯粹的 wiki 字段链接/内容，而不是其他无关字段。
			fieldName, _ := after["field_name"].(string)
			isWikiField := strings.Contains(strings.ToLower(fieldKey), "wiki") || strings.Contains(strings.ToLower(fieldName), "wiki") || strings.Contains(fieldName, "需求文档")

			if !isWikiField {
				// 如果不是 wiki 或需求文档字段，则跳过
				continue
			}

			if fieldValue, exists := after["field_value"].(interface{}); exists {
				// field_value 可能是 string (比如纯文本)，也可能是 []interface{} (比如云文档链接数组)
				switch v := fieldValue.(type) {
				case string:
					cleanText := tryExtractMultiText(v)
					contentBuilder.WriteString(fmt.Sprintf("需求文档(%s)的内容是:\n%s\n\n", fieldName, cleanText))
				case []interface{}:
					// 如果是云文档类型的字段，飞书推过来的其实是个数组，比如 ["https://..."]
					for _, item := range v {
						if strUrl, isStr := item.(string); isStr {
							contentBuilder.WriteString(fmt.Sprintf("需求文档(%s)的云文档链接为:\n%s\n\n", fieldName, strUrl))
						}
					}
				default:
					// 兜底方案：把整个接口类型强转成 JSON 字符串发给大模型
					jsonBytes, _ := json.Marshal(v)
					contentBuilder.WriteString(fmt.Sprintf("需求文档(%s)的内容是:\n%s\n\n", fieldName, string(jsonBytes)))
				}
			}
		}
	}

	// 如果由于某种原因没有匹配到名叫 wiki 的字段，做个兜底，提示可能未找到
	if contentBuilder.Len() == 0 {
		log.Printf("Warning: 未在 reference_changed 中找到名为 wiki 或需求文档的字段！")
	}

	return contentBuilder.String()
}

// tryExtractMultiText 尝试解析飞书的富文本 JSON
func tryExtractMultiText(raw string) string {
	// 如果是标准的 JSON 字符串
	if strings.HasPrefix(strings.TrimSpace(raw), "{") {
		var parseMap map[string]interface{}
		if err := json.Unmarshal([]byte(raw), &parseMap); err == nil {
			// 有些结构化文本可能有 text 或者 doc 字段
			if text, ok := parseMap["text"].(string); ok && text != "" {
				return text
			}
			if plainText, ok := parseMap["plain_text"].(string); ok && plainText != "" {
				return plainText
			}
		}
	}
	return raw // 解析失败，或者是普通文本，直接原样返回
}

// extractPrompt 提取管理员配置的 prompt 属性
func extractPrompt(customProperty interface{}) string {
	if customProperty == nil {
		log.Printf("custom_property is nil")
		return ""
	}

	if rawJSON, err := json.Marshal(customProperty); err == nil {
		log.Printf("custom_property raw JSON: %s", string(rawJSON))
	} else {
		log.Printf("failed to marshal custom_property: %v", err)
	}

	propList, ok := customProperty.([]interface{})
	if !ok {
		log.Printf("custom_property is not []interface{}, actual type: %T", customProperty)
		return ""
	}

	for idx, prop := range propList {
		propMap, ok := prop.(map[string]interface{})
		if !ok {
			log.Printf("custom_property[%d] is not map[string]interface{}, actual type: %T", idx, prop)
			continue
		}
		propType, _ := propMap["type"].(string)
		propKey, _ := propMap["key"].(string)
		propValue, _ := propMap["value"].(string)
		log.Printf("custom_property[%d]: type=%q, key=%q, value=%q, full=%v", idx, propType, propKey, propValue, propMap)

		// 根据《AI 字段事件说明》中 custom_property 的数据结构
		if propType == "custom_input_prompt" {
			if val, hasVal := propMap["value"].(string); hasVal {
				log.Printf("matched admin prompt from custom_property[%d]: %s", idx, val)
				return val
			}
		}
	}
	log.Printf("no custom_input_prompt found in custom_property")
	return ""
}

// callCozeAPI 调用扣子 (Coze) v3 Chat API
func callCozeAPI(token, botID, prompt, prdContent string) string {
	// 如果没有填写真实的 Token 或 BotID，返回 Mock 数据供联调
	if token == "YOUR_COZE_PAT_TOKEN" || botID == "YOUR_COZE_BOT_ID" {
		log.Println("未配置真实的 Coze Token 或 Bot ID，返回 Mock 数据")
		return fmt.Sprintf(`### 🌟 产品操作手册 (AI 自动生成)

#### 功能简介
本功能基于您的需求文档自动提取生成。

#### 写作要求遵循情况
我已经阅读了您的 Prompt 写作要求，并在生成时考虑了相关语气和格式。

#### 内容提取片段
基于您传入的 PRD：
> %s

---
*(提示：请在 main.go 中填入真实的 Coze Token 和 Bot ID 来替换这段占位文字。)*`, truncateString(prdContent, 100))
	}

	url := "https://api.coze.cn/v3/chat"

	// 构建发给 Coze 的消息内容
	// 如果飞书传入的内容是个富文本（包含 HTML 或 JSON），AI 可能会因为混入的标记语言而无法理解。
	// 我们在这里明确告知 AI，这是一段 JSON 或带有标签的内容，让它直接阅读内容实体。
	userMessage := fmt.Sprintf("写作要求(Prompt): %s\n\n注意：以下需求文档可能包含了富文本JSON结构或HTML标签，请你直接忽略代码和标签，提取其中的文本含义进行理解和生成：\n\n需求文档内容(PRD): %s", prompt, prdContent)
	log.Printf("Coze userMessage: %s", userMessage)

	// 构造请求体 (非流式请求)
	reqBody := map[string]interface{}{
		"bot_id":            botID,
		"user_id":           "feishu-project-webhook", // 可以用来区分调用方
		"stream":            false,
		"auto_save_history": true,
		"additional_messages": []map[string]interface{}{
			{
				"role":         "user",
				"content":      userMessage,
				"content_type": "text",
			},
		},
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		log.Printf("Coze JSON marshal error: %v", err)
		return ""
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Printf("Coze HTTP request creation error: %v", err)
		return ""
	}

	// 注入请求头
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	httpClient := &http.Client{Timeout: 60 * time.Second} // 大模型生成较慢，超时时间设长一点
	resp, err := httpClient.Do(req)
	if err != nil {
		log.Printf("Coze API request failed: %v", err)
		return ""
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read Coze API response: %v", err)
		return ""
	}

	if resp.StatusCode != http.StatusOK {
		log.Printf("Coze API error (status %d): %s", resp.StatusCode, string(respBody))
		return ""
	}

	// 解析 Coze API 的响应
	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		log.Printf("Failed to unmarshal Coze response: %v", err)
		return ""
	}

	// Coze V3 API 响应非流式请求时，它只返回一个包含 chat_id 和 conversation_id 的任务创建状态。
	// 当 status 为 "in_progress" 时，需要轮询查询是否完成，完成后再去拉取 message 列表。

	dataObj, ok := result["data"].(map[string]interface{})
	if !ok {
		log.Printf("Coze API unexpected response: %s", string(respBody))
		return ""
	}

	status := dataObj["status"].(string)
	chatID := dataObj["id"].(string)
	conversationID := dataObj["conversation_id"].(string)

	log.Printf("Coze task created. Status: %s, ChatID: %s, ConversationID: %s", status, chatID, conversationID)

	// 轮询查询任务状态
	if status == "in_progress" {
		status = pollCozeChatStatus(token, conversationID, chatID)
	}

	if status != "completed" {
		log.Printf("Coze task failed or timeout, final status: %s", status)
		return ""
	}

	// 任务完成后，拉取生成的回复消息
	// 注意：如果你的 Coze Bot 已经集成了“飞书云文档”插件，
	// Bot 在完成任务后，不仅会返回文字（比如“我已为你创建了云文档”），
	// 更重要的是，它会在返回的消息中带上一个包含飞书云文档链接的结构（通常是一段 markdown 链接或者纯 URL）。
	// 我们需要提取出这串合法的 https://... 链接。
	return fetchCozeMessages(token, conversationID, chatID)
}

// pollCozeChatStatus 轮询 Coze 任务状态直到完成或失败
func pollCozeChatStatus(token, conversationID, chatID string) string {
	url := fmt.Sprintf("https://api.coze.cn/v3/chat/retrieve?conversation_id=%s&chat_id=%s", conversationID, chatID)
	httpClient := &http.Client{Timeout: 10 * time.Second}

	for i := 0; i < 60; i++ { // 增加轮询次数到 60 次，每次 2 秒 = 120 秒
		time.Sleep(2 * time.Second)

		req, _ := http.NewRequest(http.MethodGet, url, nil)
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := httpClient.Do(req)
		if err != nil {
			log.Printf("Poll Coze status error: %v", err)
			continue
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		var result map[string]interface{}
		json.Unmarshal(body, &result)

		if data, ok := result["data"].(map[string]interface{}); ok {
			status := data["status"].(string)
			log.Printf("Polling Coze status... %s", status)
			if status == "completed" || status == "failed" || status == "requires_action" || status == "canceled" {
				return status
			}
		}
	}
	return "timeout"
}

// fetchCozeMessages 获取 Coze 对话中生成的具体文本
func fetchCozeMessages(token, conversationID, chatID string) string {
	url := fmt.Sprintf("https://api.coze.cn/v3/chat/message/list?conversation_id=%s&chat_id=%s", conversationID, chatID)

	req, _ := http.NewRequest(http.MethodGet, url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	httpClient := &http.Client{Timeout: 10 * time.Second}
	resp, err := httpClient.Do(req)
	if err != nil {
		log.Printf("Fetch Coze messages error: %v", err)
		return ""
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return ""
	}

	// 遍历 data 数组，找到 role == "assistant" 且 type == "answer" 的文本
	dataList, ok := result["data"].([]interface{})
	if !ok {
		return ""
	}

	var answerBuilder strings.Builder
	for _, item := range dataList {
		msg, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		if role, _ := msg["role"].(string); role == "assistant" {
			if msgType, _ := msg["type"].(string); msgType == "answer" {
				if content, _ := msg["content"].(string); content != "" {
					answerBuilder.WriteString(content)
					answerBuilder.WriteString("\n")
				}
			}
		}
	}

	finalAnswer := strings.TrimSpace(answerBuilder.String())
	log.Printf("Successfully fetched AI answer: %s...", truncateString(finalAnswer, 50))

	// 因为我们现在要的是“云文档链接”类型，我们需要从 AI 的回复中提取出那个真实的飞书云文档 URL。
	// Coze 可能会回复：“好的，我已经创建好了，文档地址是：https://xxxx...”
	// 我们用正则表达式把 URL 抽出来
	extractedUrl := extractFeishuURL(finalAnswer)
	if extractedUrl != "" {
		log.Printf("Extracted Feishu Doc URL: %s", extractedUrl)
		// 这里直接返回提取出来的纯 URL 即可，
		// 组装成 JSON 数组字符串的工作，统一放到 updateFeishuAIField 中处理。
		return extractedUrl
	}

	// 如果没有匹配到 URL，说明 Bot 可能出错了或者没有调用插件
	log.Printf("No valid Feishu URL found in AI answer. Falling back to the raw answer.")
	return finalAnswer
}

// extractFeishuURL 使用正则提取飞书链接
func extractFeishuURL(text string) string {
	// 匹配以 https:// 开始，包含 feishu、feishu-boe、larkoffice、larksuite 等域名的 URL
	// 如果你的飞书是私有化部署，请修改这个正则以匹配你们自己的域名
	re := regexp.MustCompile(`https?://[a-zA-Z0-9.-]*(feishu|larkoffice|larksuite)[\w.-]*/[^\s)\]'"]+`)
	match := re.FindString(text)
	return match
}

// truncateString 辅助函数：截断超长字符串用于日志打印
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

// respondJSON 辅助函数：输出 JSON 响应
func respondJSON(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"code": code,
		"msg":  msg,
	})
}
