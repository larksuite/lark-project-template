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

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.google.common.collect.Lists;
import com.lark.project.service.field.model.FieldValuePair;
import com.lark.project.service.workitem.model.WorkItemInfo;
import com.meego.demo.bo.CommitBindingInfoBO;
import com.meego.demo.bo.MergeBindingInfoBO;
import com.meego.demo.controller.BindingController.BindingResponse;
import com.meego.demo.entity.GitlabCodeBranch;
import com.meego.demo.entity.GitlabRepository;
import com.meego.demo.mapper.GitlabCodeBranchMapper;
import com.meego.demo.mapper.GitlabRepositoryMapper;
import com.meego.demo.utils.JsonUtils;
import com.meego.demo.utils.ThreadLocalUtil;
import com.meego.demo.vo.ResponseVO;
import com.meego.demo.vo.binding.CodeBranchVO;
import com.meego.demo.vo.binding.CodeCommitVO;
import com.meego.demo.vo.binding.CodeMergeRequestVO;
import com.meego.demo.vo.webhook.RepositoryVO;
import com.meego.demo.vo.webhook.UserVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BindingService {


	@Autowired
	private GitlabCodeBranchMapper gitlabCodeBranchMapper;
	
	@Autowired
	private LarkApiService larkApiService;
	
	@Autowired
	private GitlabRepositoryMapper gitlabRepositoryMapper;
	
	
	public ResponseVO<BindingResponse> GetBindingList(String projectKey, String workItemTypeKey, Long workItemId) {
		List<GitlabCodeBranch> gitlabCodeBranchs = this.getGitlabCodeBranchs(projectKey, workItemId);
		Set<String> pathWithNamespaces = gitlabCodeBranchs.stream().map(v -> v.getPathWithNamespace()).collect(Collectors.toSet());
		
		List<GitlabRepository> gitlabRepositories = this.getGitlabRepositories(projectKey, pathWithNamespaces);
		Map<String, GitlabRepository> repoMap = gitlabRepositories.stream().collect(Collectors.toMap(GitlabRepository::getPathWithNamespace, Function.identity(), (existing, replacement) -> existing));
		
		List<CodeBranchVO> branchVOs = new ArrayList<>();
		List<CodeCommitVO> commitVOs = new ArrayList<>();
		List<CodeMergeRequestVO> mergeRequestVOs = new ArrayList<>();
		
		Boolean deletable = this.checkDeletable(projectKey, workItemTypeKey, workItemId);
		
		for(GitlabCodeBranch branch : gitlabCodeBranchs) {
			GitlabRepository repository = repoMap.get(branch.getPathWithNamespace());
			RepositoryVO repositoryVO = new RepositoryVO().setName(repository.getName())
					.setPathWithNamespace(repository.getPathWithNamespace())
					.setUrl(repository.getUrl());
			switch (branch.getBindingType()) {
			case 1: // BRANCH
				CodeBranchVO branchVO = new CodeBranchVO()
					.setId(branch.getId().toString())
					.setWorkItemID(branch.getWorkItemId().toString())
					.setUpdateTime(branch.getUpdatedAt().atZone(ZoneId.systemDefault()).toEpochSecond())
					.setRepository(repositoryVO)
					.setDeletable(deletable)
					.setName(branch.getIdentifier());
				branchVOs.add(branchVO);
				break;
			case 2: // COMMIT
				CommitBindingInfoBO commitBindingInfoBO = JsonUtils.readValueAsString(branch.getBinding(), CommitBindingInfoBO.class);
				CodeCommitVO commitVO = new CodeCommitVO()
					.setId(branch.getId().toString())
					.setWorkItemID(branch.getWorkItemId().toString())
					.setUpdateTime(branch.getUpdatedAt().atZone(ZoneId.systemDefault()).toEpochSecond())
					.setRepository(repositoryVO)
					.setDeletable(deletable)
					.setCommitID(commitBindingInfoBO.getId())
					.setMessage(commitBindingInfoBO.getMessage())
					.setUrl(commitBindingInfoBO.getUrl())
					.setBranch(commitBindingInfoBO.getRef())
					.setAuthor(new UserVO(commitBindingInfoBO.getUser()));
				commitVOs.add(commitVO);
				break;
			case 3: // MERGE_REQUEST
				MergeBindingInfoBO mergeBindingInfoBO = JsonUtils.readValueAsString(branch.getBinding(), MergeBindingInfoBO.class);
				CodeMergeRequestVO mergeRequestVO = new CodeMergeRequestVO()
					.setId(branch.getId().toString())
					.setWorkItemID(branch.getWorkItemId().toString())
					.setUpdateTime(branch.getUpdatedAt().atZone(ZoneId.systemDefault()).toEpochSecond())
					.setRepository(repositoryVO)
					.setDeletable(deletable)
					.setMergeRequestID(mergeBindingInfoBO.getId().toString())
					.setTitle(mergeBindingInfoBO.getTitle())
					.setState(mergeBindingInfoBO.getState())
					.setSourceBranch(mergeBindingInfoBO.getSourceBranch())
					.setTargetBranch(mergeBindingInfoBO.getTargetBranch())
					.setUrl(mergeBindingInfoBO.getUrl())
					.setDevelopers(mergeBindingInfoBO.getDevelopers().stream().map(v -> new UserVO(v)).collect(Collectors.toList()))
					.setReviewers(mergeBindingInfoBO.getReviewers().stream().map(v -> new UserVO(v)).collect(Collectors.toList()));
				mergeRequestVOs.add(mergeRequestVO);
				break;	
			default:
				break;
			}
		}
		return ResponseVO.generateOK(new BindingResponse().setBranch(branchVOs).setCommit(commitVOs).setMergeRequest(mergeRequestVOs));
	}

	// 得到分支信息
	private List<GitlabCodeBranch> getGitlabCodeBranchs(String projectKey, Long workItemId) {
		LambdaQueryWrapper<GitlabCodeBranch> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabCodeBranch::getProjectKey, projectKey).eq(GitlabCodeBranch::getWorkItemId, workItemId);
		return this.gitlabCodeBranchMapper.selectList(queryWrapper);
	}
	
	// 得到仓库信息
	private List<GitlabRepository> getGitlabRepositories(String projectKey, Set<String> pathWithNamespaces) {
		LambdaQueryWrapper<GitlabRepository> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabRepository::getProjectKey, projectKey).in(pathWithNamespaces.size()>0, GitlabRepository::getPathWithNamespace, pathWithNamespaces);
		return this.gitlabRepositoryMapper.selectList(queryWrapper);
	}
	
	// 判断是否可删除
	private boolean checkDeletable(String projectKey, String workItemTypeKey, Long workItemId) {
		String userKey = ThreadLocalUtil.getUserKey();
		if(!StringUtils.hasLength(userKey)) {
			return false;
		}
		try {
			List<WorkItemInfo> workItemInfos = this.larkApiService.filterWorkItemDetail(projectKey, Lists.newArrayList(workItemTypeKey), Lists.newArrayList(workItemId));
			if(workItemInfos.size() > 0) {
				WorkItemInfo workItemInfo = workItemInfos.get(0);
				
				// 判断创建者
				if(userKey.equals(workItemInfo.getCreatedBy())) { 
					return true;
				}
				
				Map<String, FieldValuePair> fieldValuePairMap = workItemInfo.getFields().stream().collect(Collectors.toMap(FieldValuePair::getFieldKey, Function.identity(), (existing, replacement) -> existing));
				
				// 判断角色与模块
				boolean hasOwner = checkRoleOwners(userKey, fieldValuePairMap);
				if(hasOwner) {
					return true;
				}
				
				// 判断当前负责人
				if(checkFieldValue(userKey, fieldValuePairMap, "current_status_operator")) {
					return true;
				}
				// 判断经办人
				if(checkFieldValue(userKey, fieldValuePairMap, "issue_operator")) {
					return true;
				}
				// 判断报告人
				if(checkFieldValue(userKey, fieldValuePairMap, "issue_reporter")) {
					return true;
				}
				
				
			}
		} catch (Exception e) {
			log.warn("checkDeletable error projectKey:{}, workItemId:{}, msg:{}", projectKey, workItemId, e.getMessage());
			return false;
		}
		return false;
	}

	private Boolean checkFieldValue(String userKey, Map<String, FieldValuePair> fieldValuePairMap, String fieldKey) {
		if(fieldValuePairMap.containsKey(fieldKey)) {
			FieldValuePair fieldValuePair = fieldValuePairMap.get(fieldKey);
			@SuppressWarnings("unchecked")
			List<String> values = (List<String>)fieldValuePair.getFieldValue();
			if(values != null && values.size() > 0) {
				for(String value : values) {
					if(userKey.equals(value)) {
						return true;
					}
				}
			}
		}
		return false;
	}

	// 判断角色与模块
	private Boolean checkRoleOwners(String userKey, Map<String, FieldValuePair> fieldValuePairMap) {
		if(fieldValuePairMap.containsKey("role_owners")) {
			FieldValuePair fieldValuePair = fieldValuePairMap.get("role_owners");
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> roleOwnersValues = (List<Map<String, Object>>)fieldValuePair.getFieldValue();
			if(roleOwnersValues != null && roleOwnersValues.size() > 0) {
				for(Map<String, Object> roleOwnersValue: roleOwnersValues) {
					if(roleOwnersValue.containsKey("owners")) {
						@SuppressWarnings("unchecked")
						List<String> owners = (List<String>)roleOwnersValue.get("owners");
						if(owners != null && owners.size() > 0) {
							for(String owner : owners) {
								if(userKey.equals(owner)) {
									return true;
								}
							}
						}
					}
				}
			}
		}
		return false;
	}
	
	// 删除binding信息
	public void deleteBinding(String projectKey, String workItemTypeKey, Long workItemId, String id) {
		Boolean deletable = this.checkDeletable(projectKey, workItemTypeKey, workItemId);
		if(deletable) {
			LambdaQueryWrapper<GitlabCodeBranch> queryWrapper = new LambdaQueryWrapper<>();
			queryWrapper
			.eq(GitlabCodeBranch::getId, id)
			.eq(GitlabCodeBranch::getProjectKey, projectKey)
			.eq(GitlabCodeBranch::getWorkItemId, workItemId);
			this.gitlabCodeBranchMapper.delete(queryWrapper);
		}
	}
}
