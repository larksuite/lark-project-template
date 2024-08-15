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

package com.meego.demo.service.webhook;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.lark.project.core.utils.Lists;
import com.lark.project.service.field.model.FieldValuePair;
import com.lark.project.service.workitem.model.WorkItemInfo;
import com.lark.project.service.workitem.model.WorkItemKeyType;
import com.lark.project.service.workitem.model.WorkflowNode;
import com.meego.demo.bo.DeveloperBO;
import com.meego.demo.bo.MergeBindingInfoBO;
import com.meego.demo.entity.GitlabCodeBranch;
import com.meego.demo.entity.GitlabRepository;
import com.meego.demo.exception.LarkException;
import com.meego.demo.service.RuleService;
import com.meego.demo.service.WebhookService;
import com.meego.demo.utils.JsonUtils;
import com.meego.demo.vo.config.ElementVO;
import com.meego.demo.vo.config.MappingPairVO;
import com.meego.demo.vo.config.RuleVO;
import com.meego.demo.vo.webhook.ObjectAttributesVO;
import com.meego.demo.vo.webhook.UserVO;
import com.meego.demo.vo.webhook.WebhookVO;

import lombok.extern.slf4j.Slf4j;

/**
 * 处理 merge_request
 */
@Slf4j
@Component(WebhookService.WEBHOOK + "-" + WebhookService.MERGE_REQUEST)
public class MergeRequestWebhookHandlerStrategy extends BaseWebHookHandler implements WebHookHandlerStrategy {

	final String GITLAB_ACTION_OPEN = "open";
	final String GITLAB_ACTION_UPDATE = "update";
	final String GITLAB_ACTION_CLOSE = "close";
	final String GITLAB_ACTION_REOPEN = "reopen";
	final String GITLAB_ACTION_APPROVED = "approved";
	final String GITLAB_ACTION_UNAPPROVED = "unapproved";
	final String GITLAB_ACTION_MERGE = "merge";

	
	final Integer NODE_STATUS_UNREACH = 1; //节点状态 未开始
	final Integer NODE_STATUS_REACHED = 2; //节点状态 进行中
	final Integer NODE_STATUS_PASSED = 3; //节点状态 已完成
	
	final String GITLAB_STATE_MERGED = "merged";
	
	
	final String PATTERN_NODE = "Node"; // 节点模式
	
	
	
	
	@Override
	public void handler(String projectKey, WebhookVO data) throws LarkException {
		log.info("merge request into:{}", projectKey);
		
		GitlabRepository gitlabRepository = this.generateGitlabRepository(projectKey, data.getProject());
		if(null == gitlabRepository) {
			log.warn("projectKey:{}, gitlabRepository is null", projectKey);
			return;
		}
		
		List<GitlabCodeBranch> gitlabCodeBranchs = new ArrayList<>();
		
		// merge 逻辑
		if(null != data.getObjectAttributes()) {
			ObjectAttributesVO vo = data.getObjectAttributes();
			// 从title和desc中获取workItemId
			Set<Long> workItemIdSet = this.getWorkItemId(vo.getTitle() + "," + vo.getDescription());
			List<GitlabCodeBranch> oldList = this.queryGitlabCodeBranchs(projectKey, gitlabRepository.getPathWithNamespace(), vo.getId());
			Map<Long, GitlabCodeBranch> oldMap = oldList.stream().collect(Collectors.toMap(GitlabCodeBranch::getWorkItemId, Function.identity(), (existing, replacement) -> existing));
			
			MergeBindingInfoBO mergeBindingInfoBO = this.generateMergeBindingInfoBO(vo, data.getUser());
			for (Long workItemId : workItemIdSet) {
				// 合并逻辑
				if(oldMap.containsKey(workItemId)) {
					GitlabCodeBranch oldGitlabCodeBranch = oldMap.get(workItemId);
					oldMap.remove(workItemId);
					merge(data.getUser(), vo.getAction(), mergeBindingInfoBO, oldGitlabCodeBranch);
				}
				// 生成merge的分支信息
				GitlabCodeBranch gitlabCodeBranch = this.generateGitlabCodeBranch(projectKey, 
						workItemId, gitlabRepository.getPathWithNamespace(), BINDING_TYPE_MERGE_REQUEST, vo.getId().toString(), 
						JsonUtils.writeValueAsString(mergeBindingInfoBO));
				gitlabCodeBranchs.add(gitlabCodeBranch);
			}
			
			// 删除未命中分支
			if(oldMap.size() > 0) {
				this.gitlabCodeBranchMapper.deleteByIds(oldMap.values(), false);
			}
			this.saveResult(gitlabRepository, gitlabCodeBranchs);
			
			// triger
			try {
				// 只有merged时才进行触发
				if(GITLAB_STATE_MERGED.equals(vo.getState())) { 
					List<WorkItemKeyType> workItemKeyTypes = this.larkApiService.queryProjectWorkItemTypes(projectKey);
					List<String> workItemTypeKeys = workItemKeyTypes.stream().map(v -> v.getTypeKey()).collect(Collectors.toList());
					List<WorkItemInfo> workItemInfos = this.larkApiService.filterWorkItemDetail(projectKey, workItemTypeKeys, new ArrayList<Long>(workItemIdSet));
					Set<String> templateIds = workItemInfos.stream().map(w -> w.getTemplateID().toString()).collect(Collectors.toSet());
					Map<String, List<ElementVO>> confMap = this.getGitlabTemplateStateMap(projectKey, templateIds, gitlabRepository);
					log.info("confMap:{}", JsonUtils.writeValueAsString(confMap));
					for(WorkItemInfo workItemInfo : workItemInfos) {
						String key = this.getConfKey(workItemInfo.getWorkItemTypeKey(), workItemInfo.getTemplateID().toString());
						if(confMap.containsKey(key)) {
							List<ElementVO> targets = confMap.get(key);
							// 工作流
							trigerWorkflow(projectKey, workItemInfo, targets);
							// 状态流 没有open api 暂时不做
						}
					}
				}
			} catch (Exception e) {
				log.error("getRuleNotFill error", e);
			}
		}
	}

	// 驱动工作流
	private void trigerWorkflow(String projectKey, WorkItemInfo workItemInfo, List<ElementVO> targets) throws Exception {
		// 工作流信息存在的, 进行工作流相关逻辑
		if(PATTERN_NODE.equals(workItemInfo.getPattern())) { 
			List<WorkflowNode> nodes = this.larkApiService.queryWorkflow(projectKey, workItemInfo.getWorkItemTypeKey(), workItemInfo.getID());
			Map<String, WorkflowNode> nodeMap = nodes.stream().collect(Collectors.toMap(WorkflowNode::getStateKey, Function.identity(), (existing, replacement) -> existing));
			for(ElementVO target : targets) {
				// 流程节点中包含配置节点, 
				if(nodeMap.containsKey(target.getKey())) {
					WorkflowNode workflowNode = nodeMap.get(target.getKey());
					// 节点状态为"进行中"的
					if(workflowNode.getStatus().equals(NODE_STATUS_REACHED)) {
						// 修改系统外信号的值
						updateNodeSignal(projectKey, workItemInfo, target, workflowNode);
						// 驱动节点
						this.larkApiService.nodeOperate(projectKey, workItemInfo.getWorkItemTypeKey(), workItemInfo.getID(), workflowNode.getID());
					}
				}
			}
		}
	}

	// 修改系统外信号的值
	private void updateNodeSignal(String projectKey, WorkItemInfo workItemInfo, ElementVO target, WorkflowNode workflowNode) {
		Map<String, FieldValuePair> fieldValuePairMap = workItemInfo.getFields().stream().collect(Collectors.toMap(FieldValuePair::getFieldAlias, Function.identity(), (existing, replacement) -> existing));
		// 判断 工作项实例 内的信号字段值,如果存在并且为true 不重复设置
		if(fieldValuePairMap.containsKey(target.getSignalKey()) && (boolean)fieldValuePairMap.get(target.getSignalKey()).getFieldValue()) {
			return;
		}
		
		FieldValuePair v = new FieldValuePair();
		v.setFieldAlias(target.getSignalKey());
		v.setFieldValue(true);
		try {
			this.larkApiService.nodeUpdate(projectKey, workItemInfo.getWorkItemTypeKey(), workItemInfo.getID(), workflowNode.getID(), Lists.newArrayList(v));
		} catch (Exception e) {
			log.info("nodeUpdate error msg:{}", e.getMessage());
		}
	}
	
	private String getConfKey(String workItemType, String templateId) {
		return workItemType + "," + templateId;
	}
	
	// 得到配置信息 key: workItemType,templateId  value: 相应节点
	private Map<String, List<ElementVO>> getGitlabTemplateStateMap(String projectKey, Set<String> templateIds, GitlabRepository gitlabRepository) throws Exception {
		Map<String, List<ElementVO>> resultMap = new HashMap<>();
		List<RuleVO> ruleVOs = this.ruleService.getRuleNotFill(projectKey);
		for (RuleVO ruleVO : ruleVOs) {
			// 开关为打开
			if(ruleVO.getEnable()) {
				// 流程存在
				if(templateIds.contains(ruleVO.getTemplate().getId())) {
					for (MappingPairVO mappingPairVO : ruleVO.getForward()) {
						// 事件为merge_request
						if(mappingPairVO.getSource().getKey().equals(RuleService.MERGE_REQUEST)) {
							boolean findRepo = mappingPairVO.getRepositories().stream().filter(v -> v.getPathWithNamespace().equals(gitlabRepository.getPathWithNamespace().trim())).findAny().isPresent();
							// 仓库无限制或者匹配
							if(mappingPairVO.getRepositories().size() == 0 || findRepo) {
								// 对应工作项里的对应流程
								String key = this.getConfKey(ruleVO.getWorkItemType().getKey(),ruleVO.getTemplate().getId());
								if(resultMap.containsKey(key)) {
									resultMap.get(key).addAll(mappingPairVO.getTargets());
								}else {
									resultMap.put(key, mappingPairVO.getTargets());
								}
							}
						}
					}
				}
			}
		}
		return resultMap;
	}

	// 合并 bind 信息
	private void merge(UserVO userVO, String action, MergeBindingInfoBO mergeBindingInfoBO, GitlabCodeBranch oldGitlabCodeBranch) {
		if(BINDING_TYPE_MERGE_REQUEST.equals(oldGitlabCodeBranch.getBindingType())) {
			MergeBindingInfoBO oldBindingInfoBO = JsonUtils.readValueAsString(oldGitlabCodeBranch.getBinding(), MergeBindingInfoBO.class);
			DeveloperBO developerBO = new DeveloperBO(userVO);
			// 合并
			switch (action) {
			case GITLAB_ACTION_APPROVED:
				Set<Integer> oldUidSet = oldBindingInfoBO.getReviewers().stream().map(v -> v.getId()).collect(Collectors.toSet());
				if(!oldUidSet.contains(userVO.getId())) {// 有新的 reviewer 与原有的进行合并
					mergeBindingInfoBO.setReviewers(oldBindingInfoBO.getReviewers());
					mergeBindingInfoBO.getReviewers().add(developerBO);
				}
				break;
			case GITLAB_ACTION_UNAPPROVED:
				oldUidSet = oldBindingInfoBO.getReviewers().stream().map(v -> v.getId()).collect(Collectors.toSet());
				if(!oldUidSet.contains(userVO.getId())) { 
					mergeBindingInfoBO.getReviewers().add(developerBO);
				}
				break;
			case GITLAB_ACTION_OPEN:
			case GITLAB_ACTION_UPDATE:
			case GITLAB_ACTION_REOPEN:
				oldUidSet = oldBindingInfoBO.getDevelopers().stream().map(v -> v.getId()).collect(Collectors.toSet());
				if(!oldUidSet.contains(userVO.getId())) {// 有新的 developer 与原有的进行合并
					mergeBindingInfoBO.setDevelopers(oldBindingInfoBO.getDevelopers());
					mergeBindingInfoBO.getDevelopers().add(developerBO);
				}	
				break;
			case GITLAB_ACTION_MERGE:
				oldUidSet = oldBindingInfoBO.getMerger().stream().map(v -> v.getId()).collect(Collectors.toSet());
				if(!oldUidSet.contains(userVO.getId())) {// 有新的 merger 与原有的进行合并
					mergeBindingInfoBO.setMerger(oldBindingInfoBO.getMerger());
					mergeBindingInfoBO.getMerger().add(developerBO);
				}
				break;
			default:
				break;
			}
		}
	}
	
	// 生成merge bind BO
	private MergeBindingInfoBO generateMergeBindingInfoBO(ObjectAttributesVO vo, UserVO userVO) {
		MergeBindingInfoBO mergeBindingInfoBO = new MergeBindingInfoBO()
			.setId(vo.getId())
			.setTitle(vo.getTitle())
			.setDescription(vo.getDescription())
			.setTargetBranch(vo.getTargetBranch())
			.setSourceBranch(vo.getSourceBranch())
			.setState(vo.getState())
			.setAction(vo.getAction())
			.setUrl(vo.getUrl())
			.setCreatedAt(vo.getCreatedAt())
			.setUpdatedAt(vo.getUpdatedAt());

		DeveloperBO developerBO = new DeveloperBO(userVO);
		switch (vo.getAction()) {
		case GITLAB_ACTION_APPROVED:
		case GITLAB_ACTION_UNAPPROVED:
			mergeBindingInfoBO.getReviewers().add(developerBO);
			break;
		case GITLAB_ACTION_OPEN:
		case GITLAB_ACTION_UPDATE:
		case GITLAB_ACTION_REOPEN:
			mergeBindingInfoBO.getDevelopers().add(developerBO);
			break;
		case GITLAB_ACTION_MERGE:
			mergeBindingInfoBO.getMerger().add(developerBO);
			break;
		default:
			break;
		}
		
		return mergeBindingInfoBO;
	}

}
