# 飞书项目 AI 字段接入扣子 (Coze) 自动化生成指南

本项目是一个基于 Go 语言的 Webhook 服务，用于打通**飞书项目 (Lark Project) AI 字段**与**扣子 (Coze) 智能体**。
通过该服务，当用户在飞书项目中点击 AI 字段的“生成”按钮时，服务会自动提取飞书工作项中的需求文档 (PRD) 链接/内容，结合管理员配置的写作要求 (Prompt)，发送给具备“飞书云文档”插件能力的扣子智能体，并将最终生成的云文档链接自动回写到飞书项目 AI 字段中。

---

## 🚀 核心工作流

1. **接收 Webhook 事件**：飞书项目触发 AI 字段生成事件 (Event Type: `8101` / `8102`)，向本服务发送 POST 请求。
2. **解析与提取上下文**：
   - 从 `reference_changed` 中提取引用的需求文档 (Wiki/云文档) 内容。
   - 从 `custom_property` 中提取管理员配置的“自定义提示词” (Prompt)。
3. **调用扣子 (Coze) v3 API**：
   - 使用提取到的 PRD 和 Prompt，以非流式 (Non-stream) 方式调用 Coze Chat API。
   - 轮询查询任务状态 (`in_progress` -> `completed`)。
   - 任务完成后，拉取对话消息，并通过正则表达式提取生成的“飞书云文档 URL”。
4. **回写飞书项目**：
   - 获取飞书项目的 `plugin_access_token`。
   - 调用飞书 OpenAPI `/open_api/ai_application_field/update`，将提取出的云文档 URL 更新到目标 AI 字段中。

---

## 🛠 准备工作

在运行本项目之前，您需要准备以下信息：

### 1. 飞书项目 (Lark Project) 凭证
- **Plugin ID** 和 **Plugin Secret**：用于初始化 SDK 和获取 `plugin_access_token`。
- **User Key**：用于在回写字段时表明操作人身份（若无前端用户上下文，需指定一个有权限的默认 User Key）。

### 2. 扣子 (Coze) 凭证与配置
- **Personal Access Token (PAT)**：从扣子开发者平台获取。
- **Bot ID**：您的智能体 ID。
- **智能体插件配置**：您的智能体**必须**添加并配置好“飞书云文档”相关插件，以便它能根据 Prompt 生成文档并返回真实 URL。

### 3. 公网可访问的域名
飞书 Webhook 需要一个公网 HTTPS/HTTP 地址。本地开发联调时，建议使用 `localtunnel` 或 `ngrok` 进行内网穿透。

---

## ⚙️ 配置说明

在运行前，请打开 [`main.go`](main.go) 文件，修改以下核心配置常量和变量：

```go
// 1. 飞书项目插件配置 (main.go 顶部)
const (
    PluginID     = "YOUR_PLUGIN_ID"
    PluginSecret = "YOUR_PLUGIN_SECRET"
    ProjectAPIHost = "https://project.feishu.cn" // 私有化或 BOE 环境请修改对应域名
)

// 2. 扣子 (Coze) 凭证配置 (processAndCallback 函数内)
cozeToken := "YOUR_COZE_PAT_TOKEN"
cozeBotID := "YOUR_COZE_BOT_ID"

// 3. 默认 User Key (updateFeishuAIField 函数内)
if userKey == "" {
    userKey = "YOUR_DEFAULT_USER_KEY" // 当 Webhook 未携带 User Key 时使用的兜底身份
}
```

---

## 🏃 运行服务

### 1. 启动 Go Webhook 服务
在项目根目录下执行：
```bash
go run main.go
```
服务默认在本地 `8000` 端口启动。

### 2. 启动内网穿透 (本地联调)
打开新的终端，使用 `localtunnel` 将本地端口暴露到公网：
```bash
npx localtunnel --port 8000
```
> 将生成的公网 URL（例如 `https://your-url.loca.lt`）复制下来。

### 3. 配置飞书项目 Webhook
1. 进入飞书项目 -> 开放平台 -> 插件配置 -> Webhook。
2. 将回调地址设置为：`https://your-url.loca.lt/webhook/feishu/ai_field`。
3. 勾选相关的“AI 字段”事件。

---

## 📝 飞书项目 AI 字段配置要求

为了让本服务正常工作，飞书项目前端的 AI 字段配置需要满足以下条件：

1. **输出字段类型**：建议设置为 **“云文档链接” (link_cloud_doc)** 或是普通文本类型。
   - ⚠️ **注意**：官方 API 不支持回写附件类型 (`multi_file`)。本服务内置了拦截逻辑，遇到 `multi_file` 会直接跳过。
2. **参考字段配置**：确保配置了引用字段，并且名称中包含 `wiki` 或 `需求文档`，以便服务能够通过 `extractPRDContent` 提取上下文。
3. **写作要求配置**：在 AI 字段设置中配置管理员视角的 Prompt (对应 Webhook payload 中的 `custom_input_prompt`)。

---

## 🐞 核心避坑指南 (Troubleshooting)

在开发与联调本工程时，可能会遇到以下典型问题：

### 1. 飞书字段更新报错: `value is not string` / `invalid param`
**原因**：飞书 `/open_api/ai_application_field/update` 接口对 `field_value` 的格式要求极为严苛。即便前端是云文档数组，API 也要求传入字符串格式。
**解决**：本工程在 `updateFeishuAIField` 中已做处理，将提取的 URL 包装为严格的带双引号字符串格式：
```go
formattedFieldValue := fmt.Sprintf("\"%s\"", cloudDocURL)
```

### 2. 获取 Plugin Token 报错: `Plugin Token Must Have User Key`
**原因**：调用部分飞书项目 API 需要用户上下文。
**解决**：在 HTTP 请求头中必须携带 `X-USER-KEY`，如果 Webhook 没有传递，代码中会使用预设的默认 `userKey`。

### 3. 无法提取到管理员配置的 Prompt
**原因**：Webhook 的 `custom_property` 是一个包含多个自定义属性的 JSON 数组。
**解决**：工程中 `extractPrompt` 函数会遍历数组，寻找 `type == "custom_input_prompt"` 的对象，提取其 `value`。如果未提取到，可以通过查看日志中的 `custom_property raw JSON` 来排查飞书实际下发的结构。

### 4. Coze 返回的链接带有 Markdown 标记导致飞书打不开
**原因**：大模型往往返回 `[文档](https://...)` 或在 URL 前后加反引号。
**解决**：工程内置了 `extractFeishuURL` 函数，使用正则表达式严格提取以 `http` 开头的纯净飞书链接，丢弃其他干扰字符。

---

## 💻 核心代码参考 (已脱敏)

以下是本项目最核心的几个实现步骤，您可以直接参考或复制到您的工程中。

### 1. 处理 Webhook 信息，提取需求文档 PRD 和写作要求 Prompt
飞书 Webhook 将管理员配置的提示词放在了 `custom_property` 数组中，将引用的需求文档内容放在了 `reference_changed` 中。我们需要解析 Payload 并分别提取它们：

```go
func extractPrompt(customProperty interface{}) string {
	propList, ok := customProperty.([]interface{})
	if !ok { return "" }

	for _, prop := range propList {
		propMap, ok := prop.(map[string]interface{})
		if !ok { continue }
		
		propType, _ := propMap["type"].(string)
		if propType == "custom_input_prompt" {
			if val, hasVal := propMap["value"].(string); hasVal {
				return val // 返回管理员设置的 Prompt
			}
		}
	}
	return ""
}

// 提取 PRD 的代码可以参考以下逻辑
func extractPRDContent(referenceChanged interface{}) string {
    // 遍历 reference_changed 数组
    // 找到引用的文档 (例如包含 wiki 或 doc 关键字的引用)
    // 提取其内容作为 PRD 上下文
    // ... 具体实现视业务需求而定
    return prdContent
}
```

### 2. 调用 Coze v3 API 生成文档
通过发送非流式请求（包含 Prompt 和提取的 PRD），轮询查询进度，并最终提取生成的云文档 URL：

```go
func callCozeAPI(token, botID, prompt, prdContent string) string {
	url := "https://api.coze.cn/v3/chat"
	userMessage := fmt.Sprintf("写作要求(Prompt): %s\n\n需求文档内容(PRD): %s", prompt, prdContent)
	
	reqBody := map[string]interface{}{
		"bot_id":            botID,
		"user_id":           "feishu-project-webhook",
		"stream":            false,
		"auto_save_history": true,
		"additional_messages": []map[string]interface{}{
			{"role": "user", "content": userMessage, "content_type": "text"},
		},
	}
	// ... 序列化后发送 POST 请求，携带 Authorization: Bearer {token}
	
	// 发送成功后获取 Task 的 status, chat_id, conversation_id
	// 如果 status == "in_progress"，则需要轮询：
	// GET https://api.coze.cn/v3/chat/retrieve?conversation_id={...}&chat_id={...}
	// 直到 status 变为 "completed"

	// 任务完成后，拉取对话列表并提取最后一条 AI 回复：
	// GET https://api.coze.cn/v3/chat/message/list?conversation_id={...}&chat_id={...}
	// finalAnswer := "..." (AI 回复的内容)

	// 使用正则从文本中精准提取飞书云文档链接
	re := regexp.MustCompile(`https?://[a-zA-Z0-9.-]*(feishu|larkoffice|larksuite)[\w.-]*/[^\s)\]'"]+`)
	return re.FindString(finalAnswer)
}
```

### 3. 将结果写回飞书项目 AI 字段
调用 OpenAPI，需要特别注意 `field_value` 的格式：

```go
func updateFeishuAIField(pluginToken, taskID, userKey, generatedContent string) error {
	url := "https://project.feishu.cn/open_api/ai_application_field/update" // 私有化需修改域名

	// ⚠️ 关键点：即使目标字段是云文档数组，这里的 field_value 也必须是合法的 JSON 字符串表示
	cloudDocURL := strings.TrimSpace(generatedContent)
	formattedFieldValue := fmt.Sprintf("\"%s\"", cloudDocURL) 

	reqBody := map[string]interface{}{
		"ai_task_id":  taskID,
		"field_value": formattedFieldValue,
	}
	jsonBody, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Plugin-Token", pluginToken)
	
	// 回写操作必须带有用户身份
	if userKey == "" {
		userKey = "YOUR_DEFAULT_USER_KEY" // 替换为兜底的用户 Key
	}
	req.Header.Set("X-USER-KEY", userKey) 

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	// ... 检查 resp.StatusCode 是否为 200
	return err
}
```
