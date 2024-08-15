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

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.ibatis.exceptions.PersistenceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.meego.demo.config.LarkPropertiesConfiguration;
import com.meego.demo.entity.GitlabCodeBranch;
import com.meego.demo.entity.GitlabRepository;
import com.meego.demo.mapper.GitlabCodeBranchMapper;
import com.meego.demo.mapper.GitlabRepositoryMapper;
import com.meego.demo.service.LarkApiService;
import com.meego.demo.service.RuleService;
import com.meego.demo.utils.JsonUtils;
import com.meego.demo.vo.webhook.ProjectVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class BaseWebHookHandler {

	@Autowired
	LarkPropertiesConfiguration larkPropertiesConfiguration;
	
	@Autowired
	LarkApiService larkApiService;
	
	@Autowired
	RuleService ruleService;
	
	@Autowired
	GitlabCodeBranchMapper gitlabCodeBranchMapper;
	
	@Autowired
	GitlabRepositoryMapper gitlabRepositoryMapper;
	
	// 数字正则表达式
	private Pattern number = Pattern.compile("\\d+");
	
	public static final Integer BINDING_TYPE_BRANCH = 1;
	public static final Integer BINDING_TYPE_COMMIT = 2;
	public static final Integer BINDING_TYPE_MERGE_REQUEST = 3;
	
	
	/**
	 * 提取 WorkItemId
	 * @param str
	 */
	Set<Long> getWorkItemId(String str) {
		Set<Long> set = new HashSet<>();
		if(str.toLowerCase().startsWith("merge branch") || str.toLowerCase().startsWith("merge remote-tracking branch")) {
			return set;
		}
		
		Pattern pattern = Pattern.compile(larkPropertiesConfiguration.getLinkRule());
		Matcher matcher = pattern.matcher(str);
		while(matcher.find()) {
			Matcher vm = number.matcher(matcher.group());
			if(vm.find()) {
				set.add(Long.valueOf(vm.group()));
			}
		}
		log.info("set:{}", JsonUtils.writeValueAsString(set));
		return set;
	}
	
	// 生成仓库
	GitlabRepository generateGitlabRepository(String projectKey, ProjectVO projectVO) {
		if(null == projectVO) {
			return null;
		}
		GitlabRepository repository = new GitlabRepository();
		repository.setProjectKey(projectKey);
		repository.setOriginId(projectVO.getId());
		repository.setName(projectVO.getName());
		repository.setPathWithNamespace(projectVO.getPathWithNamespace());
		repository.setUrl(projectVO.getUrl());
		return repository;
	}
	
	// 查询已存在的gitlab代码分支
	List<GitlabCodeBranch> queryGitlabCodeBranchs(String projectKey, String pathWithNamespace, Object... identifier) {
		LambdaQueryWrapper<GitlabCodeBranch> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper
			.eq(GitlabCodeBranch::getProjectKey, projectKey)
			.eq(GitlabCodeBranch::getPathWithNamespace, pathWithNamespace)
			.in(GitlabCodeBranch::getIdentifier, identifier);
		return gitlabCodeBranchMapper.selectList(queryWrapper);
	}
	
	GitlabCodeBranch generateGitlabCodeBranch(String projectKey, Long workItemId, String pathWithNamespace, Integer bindingType, String identifier, String binding) {
		return new GitlabCodeBranch()
			.setProjectKey(projectKey)
			.setWorkItemId(workItemId)
			.setPathWithNamespace(pathWithNamespace)
			.setBindingType(bindingType)
			.setIdentifier(identifier)
			.setBinding(binding);
	}
	
	public void saveGitlabCodeBranch(List<GitlabCodeBranch> gitlabCodeBranchs) {
		try {
			this.gitlabCodeBranchMapper.insert(gitlabCodeBranchs);
		} catch (PersistenceException e) { //批量插入出现冲突后进行单独插入,冲突数据进行更新
			log.warn("batch insert error: gitlabCodeBranchs {}", JsonUtils.writeValueAsString(gitlabCodeBranchs));
			for (GitlabCodeBranch g : gitlabCodeBranchs) {
				try {
					this.gitlabCodeBranchMapper.insert(g);
				} catch (DuplicateKeyException e2) {
					log.info("DuplicateKeyException ProjectKey:{}, PathWithNamespace:{}, Identifier:{}", g.getProjectKey(), g.getPathWithNamespace(), g.getIdentifier());
					LambdaUpdateWrapper<GitlabCodeBranch> updateWrapper = new LambdaUpdateWrapper<>();
					updateWrapper
						.eq(GitlabCodeBranch::getProjectKey, g.getProjectKey())
						.eq(GitlabCodeBranch::getPathWithNamespace, g.getPathWithNamespace())
						.in(GitlabCodeBranch::getIdentifier, g.getIdentifier())
						.set(GitlabCodeBranch::getBinding, g.getBinding())
						.set(GitlabCodeBranch::getUpdatedAt, new Date());
					this.gitlabCodeBranchMapper.update(updateWrapper);
				}
			}
		}
	}
	
	private void saveGitlabRepository(GitlabRepository gitlabRepository) {
		try {
			this.gitlabRepositoryMapper.insert(gitlabRepository);
		}catch (DuplicateKeyException e2) {
			LambdaUpdateWrapper<GitlabRepository> updateWrapper = new LambdaUpdateWrapper<>();
			updateWrapper
				.eq(GitlabRepository::getProjectKey, gitlabRepository.getProjectKey())
				.eq(GitlabRepository::getPathWithNamespace, gitlabRepository.getPathWithNamespace())
				.set(GitlabRepository::getUpdatedAt, new Date());
			this.gitlabRepositoryMapper.update(updateWrapper);
		}
	}
	
	@Transactional
	void saveResult(GitlabRepository gitlabRepository, List<GitlabCodeBranch> gitlabCodeBranchs) {
		this.saveGitlabRepository(gitlabRepository);
		this.saveGitlabCodeBranch(gitlabCodeBranchs);
	}
	
}
