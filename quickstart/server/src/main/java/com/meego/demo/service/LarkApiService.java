/**
 * Copyright (2024) Bytedance Ltd. and/or its affiliates 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */

package com.meego.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lark.project.Client;
import com.lark.project.core.request.RequestOptions;
import com.lark.project.core.request.RequestOptions.Builder;
import com.lark.project.core.token.AccessTokenType;
import com.lark.project.core.utils.Jsons;
import com.lark.project.core.utils.Lists;
import com.lark.project.service.field.builder.CreateFieldReq;
import com.lark.project.service.field.builder.CreateFieldResp;
import com.lark.project.service.field.builder.QueryProjectFieldsReq;
import com.lark.project.service.field.builder.QueryProjectFieldsResp;
import com.lark.project.service.field.model.FieldValuePair;
import com.lark.project.service.field.model.SimpleField;
import com.lark.project.service.plugin.builder.GetUserPluginTokenReq;
import com.lark.project.service.plugin.builder.GetUserPluginTokenResp;
import com.lark.project.service.plugin.model.UserPluginToken;
import com.lark.project.service.project.builder.GetProjectDetailReq;
import com.lark.project.service.project.builder.GetProjectDetailResp;
import com.lark.project.service.project.builder.ListProjectWorkItemTypeReq;
import com.lark.project.service.project.builder.ListProjectWorkItemTypeResp;
import com.lark.project.service.project.model.Project;
import com.lark.project.service.workitem.builder.FilterReq;
import com.lark.project.service.workitem.builder.FilterResp;
import com.lark.project.service.workitem.builder.NodeOperateReq;
import com.lark.project.service.workitem.builder.NodeOperateResp;
import com.lark.project.service.workitem.builder.NodeUpdateReq;
import com.lark.project.service.workitem.builder.NodeUpdateResp;
import com.lark.project.service.workitem.builder.QueryWorkflowReq;
import com.lark.project.service.workitem.builder.QueryWorkflowResp;
import com.lark.project.service.workitem.builder.UpdateWorkItemReq;
import com.lark.project.service.workitem.builder.UpdateWorkItemResp;
import com.lark.project.service.workitem.model.WorkItemInfo;
import com.lark.project.service.workitem.model.WorkItemKeyType;
import com.lark.project.service.workitem.model.WorkflowNode;
import com.lark.project.service.workitem_conf.builder.QueryTemplateDetailReq;
import com.lark.project.service.workitem_conf.builder.QueryTemplateDetailResp;
import com.lark.project.service.workitem_conf.builder.QueryWorkItemTemplatesReq;
import com.lark.project.service.workitem_conf.builder.QueryWorkItemTemplatesResp;
import com.lark.project.service.workitem_conf.model.TemplateConf;
import com.lark.project.service.workitem_conf.model.TemplateDetail;
import com.meego.demo.config.LarkPropertiesConfiguration;
import com.meego.demo.exception.ErrorInfo;
import com.meego.demo.exception.LarkException;
import com.meego.demo.utils.ThreadLocalUtil;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LarkApiService {

	private Client client;

	@Autowired
    private LarkPropertiesConfiguration configuration;
	
	@PostConstruct
	public void init() {
		client = Client.newBuilder(configuration.getPluginId(), configuration.getPluginSecret())
				.accessTokenType(AccessTokenType.AccessTokenTypePlugin)
				.build();
	}
	
	private RequestOptions getRequestOptions() {
		Builder builder = RequestOptions.newBuilder();
		builder.userKey(configuration.getUserKey()); // 默认userKey, 用于调试
		
		Optional<UserPluginToken> optional = ThreadLocalUtil.get();
		if(optional != null && optional.isPresent()) { // 当前登录用户的userKey
			builder.userKey(optional.get().getUserKey());
			builder.accessToken(optional.get().getToken());
		}
		
		return builder.build();
	}
	
	//创建工作项自定义字段
	public void createWorkItemField(String projectKey, String workItemType,String fieldAlias, String templateName, String fieldName) throws Exception {
		CreateFieldReq req = CreateFieldReq.newBuilder()
				.projectKey(projectKey)
				.workItemTypeKey(workItemType)
				.fieldAlias(fieldAlias)
				.fieldName("gitlab 信号 " + templateName + " " + fieldName)
				.fieldTypeKey("signal")
				.build();
		
		CreateFieldResp resp = client.getFieldService().createField(req, this.getRequestOptions());
		
		if (!resp.success()) {
            log.info("createWorkItemField error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return;
        }
		log.info("createWorkItemField result:{}", Jsons.DEFAULT.toJson(resp.getData()));

	}
	
	//更新工作项自定义字段
	public void updateWorkItemField(String projectKey, String workItemType, Long workItemID, List<FieldValuePair> updateFields) throws Exception {
		UpdateWorkItemReq req = UpdateWorkItemReq.newBuilder()
				.projectKey(projectKey)
				.workItemTypeKey(workItemType)
				.workItemID(workItemID)
				.updateFields(updateFields)
				.build();
		
		UpdateWorkItemResp resp = client.getWorkItemService().updateWorkItem(req, this.getRequestOptions());
		
		if (!resp.success()) {
            log.info("createWorkItemField error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return;
        }
	}
	
	// 获取工作项字段信息
	public List<SimpleField> queryWorkItemField(String projectKey, String workItemType) throws Exception {
		QueryProjectFieldsReq req = QueryProjectFieldsReq.newBuilder()
				.projectKey(projectKey)
				.workItemTypeKey(workItemType)
				.build();
		
		QueryProjectFieldsResp resp = client.getFieldService().queryProjectFields(req, this.getRequestOptions());
		
		if (!resp.success()) {
            log.info("queryWorkItemField error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return null;
        }
		log.info("searchWorkItemField result:{}", Jsons.DEFAULT.toJson(resp.getData()));
		return resp.getData();
		
	}

	
	public static final Integer WORKITEMKEYTYPE_IS_DISABLE = 1; // 是否禁用，1为禁用，2为启用
	
	// 获取空间下工作项类型
	public List<WorkItemKeyType> queryProjectWorkItemTypes(String projectKey) throws Exception {
		ListProjectWorkItemTypeReq req = ListProjectWorkItemTypeReq.newBuilder()
				.projectKey(projectKey)
				.build();
		
		ListProjectWorkItemTypeResp resp = client.getProjectService().listProjectWorkItemType(req, getRequestOptions());

		if (!resp.success()) {
            log.info("queryProjectWorkItemTypes error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return null;
        }
		log.info("queryProjectWorkItemTypes result:{}", Jsons.DEFAULT.toJson(resp.getData()));
		return resp.getData();
		
	}
	
	public static final Long TEMPLATEDETAIL_IS_DISABLED = 1l; // 是否禁用，1为禁用，2为启用
	
	// 获取流程模版配置详情
	public TemplateDetail queryWorkItemTemplateDetail(String projectKey, Long templateID) throws Exception {
		QueryTemplateDetailReq req = QueryTemplateDetailReq.newBuilder()
				.projectKey(projectKey)
				.templateID(templateID)
				.build();
		
		QueryTemplateDetailResp resp = client.getWorkItemConfService().queryTemplateDetail(req, getRequestOptions());

		if (!resp.success()) {
            log.info("queryWorkItemTemplateDetail error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return null;
        }
		log.info("queryWorkItemTemplateDetail result:{}", Jsons.DEFAULT.toJson(resp.getData()));
		return resp.getData();
		
	}
	
	// 获取指定的工作项列表（单空间）
	public List<WorkItemInfo> filterWorkItemDetail(String projectKey, List<String> workItemTypeKeys, List<Long> workItemIds) throws Exception {
		FilterReq req = FilterReq.newBuilder()
				.projectKey(projectKey)
				.workItemTypeKeys(workItemTypeKeys)
				.workItemIDs(workItemIds)
				.build();
				
		FilterResp resp = client.getWorkItemService().filter(req, getRequestOptions());
		if (!resp.success()) {
            log.info("filterWorkItemDetail error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return null;
        }
		log.info("filterWorkItemDetail result:{}", Jsons.DEFAULT.toJson(resp.getData()));
		return resp.getData();
	}
	
	// 获取工作流详情
	public List<WorkflowNode> queryWorkflow(String projectKey, String workItemType, Long workItemId) throws Exception {
		QueryWorkflowReq req = QueryWorkflowReq.newBuilder()
				.projectKey(projectKey)
				.workItemTypeKey(workItemType)
				.workItemID(workItemId)
				.build();
		QueryWorkflowResp resp = client.getWorkItemService().queryWorkflow(req, getRequestOptions());
		if (!resp.success()) {
            log.info("queryWorkflow error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return null;
        }
		log.info("queryWorkflow result:{}", Jsons.DEFAULT.toJson(resp.getData()));
		return resp.getData().getWorkflowNodes();
	}
	
	// 更新节点
	public void nodeUpdate(String projectKey, String workItemType, Long workItemId, String nodeId, List<FieldValuePair> fields) throws Exception {
		NodeUpdateReq req = NodeUpdateReq.newBuilder()
				.projectKey(projectKey)
				.workItemTypeKey(workItemType)
				.workItemID(workItemId)
				.nodeID(nodeId)
				.fields(fields)
				.build();
		NodeUpdateResp resp = client.getWorkItemService().nodeUpdate(req, getRequestOptions());
		if (!resp.success()) {
            log.info("nodeUpdate error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
        }
	}
	
	// 节点完成
	public void nodeOperate(String projectKey, String workItemType, Long workItemId, String nodeId) throws Exception {
		NodeOperateReq req = NodeOperateReq.newBuilder()
				.projectKey(projectKey)
				.workItemTypeKey(workItemType)
				.workItemID(workItemId)
				.nodeID(nodeId)
				.action("confirm")
				.build();
		NodeOperateResp resp = client.getWorkItemService().nodeOperate(req, getRequestOptions());
		if (!resp.success()) {
            log.info("nodeOperate error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
        }
	}
	
	// 获取空间详情, 用于判断是否有管理员权限
	public Project getProjectDetail(String projectKey, String userKey) throws Exception {
		GetProjectDetailReq req = GetProjectDetailReq.newBuilder()
				.projectKeys(Lists.newArrayList(projectKey))
				.userKey(userKey)
				.build();
		GetProjectDetailResp resp = client.getProjectService().getProjectDetail(req, getRequestOptions());
		if (!resp.success()) {
            log.info("getProjectDetail error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return null;
        }
		log.info("getProjectDetail result:{}", Jsons.DEFAULT.toJson(resp.getData()));
		return resp.getData().get(projectKey);
	}
	
	// 获取工作项下的流程模版列表
	public List<TemplateConf> queryWorkItemTemplates(String projectKey, String workItemType) throws Exception {
		QueryWorkItemTemplatesReq req = QueryWorkItemTemplatesReq.newBuilder()
				.projectKey(projectKey)
				.workItemTypeKey(workItemType)
				.build();
		QueryWorkItemTemplatesResp resp = client.getWorkItemConfService().queryWorkItemTemplates(req, getRequestOptions());
		if (!resp.success()) {
            log.info("queryWorkItemTemplates error code:{},msg:{},reqId:{}", resp.getErrCode(), resp.getErrMsg(), resp.getRequestId());
            return null;
        }
		log.info("queryWorkItemTemplates result:{}", Jsons.DEFAULT.toJson(resp.getData()));
		return resp.getData();
	}
	

	// 用户登录
	public UserPluginToken login(String code) throws Exception {
		GetUserPluginTokenReq req = GetUserPluginTokenReq.newBuilder()
				.code(code)
				.grantType("authorization_code")
				.build();
		GetUserPluginTokenResp resp = client.getPluginService().getUserPluginToken(req, null);
		if (resp.getErr().getCode() != 0) {
            log.info("login error errCode:{}, errMsg:{}, code:{}", resp.getErr().getCode(), resp.getErr().getMsg(), code);
            throw new LarkException(ErrorInfo.LARK_SERVICE_ERROR, resp.getErr().getMsg());
        }
		log.info("UserPluginToken result:{}", Jsons.DEFAULT.toJson(resp));
		return resp.getData();
	}
	
}
