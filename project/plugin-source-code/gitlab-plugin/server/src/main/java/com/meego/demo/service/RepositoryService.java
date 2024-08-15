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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.ibatis.exceptions.PersistenceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.meego.demo.controller.ConfigController.PathWithNamespaceVO;
import com.meego.demo.entity.GitlabRepository;
import com.meego.demo.mapper.GitlabRepositoryMapper;
import com.meego.demo.utils.JsonUtils;

import lombok.extern.slf4j.Slf4j;

/**
 * 仓库 Service
 */
@Slf4j
@Service
public class RepositoryService {


	@Autowired
	private GitlabRepositoryMapper gitlabRepositoryMapper;
	
	// 得到仓库相关信息
	public List<GitlabRepository> getGitlabRepositories(String projectKey) {
		LambdaQueryWrapper<GitlabRepository> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabRepository::getProjectKey, projectKey);
		return gitlabRepositoryMapper.selectList(queryWrapper);
	}
	
	// 插入或者更新仓库信息
	public void saveGitlabRepositorie(String projectKey, List<PathWithNamespaceVO> pathWithNamespaces) {
		List<GitlabRepository> gitlabRepositories = new ArrayList<>();
		for (PathWithNamespaceVO pathWithNamespace : pathWithNamespaces) {
			if(StringUtils.hasLength(pathWithNamespace.getPathWithNamespace())) {
				GitlabRepository gitlabRepository = new GitlabRepository().setProjectKey(projectKey)
						.setName(pathWithNamespace.getPathWithNamespace().trim())
						.setPathWithNamespace(pathWithNamespace.getPathWithNamespace().trim());
				gitlabRepositories.add(gitlabRepository);
			}
		}
		try {
			gitlabRepositoryMapper.insert(gitlabRepositories);
		}  catch (PersistenceException e) { //批量插入出现冲突后进行单独插入,冲突数据进行更新
			log.warn("batch insert error: gitlabCodeBranchs {}", JsonUtils.writeValueAsString(gitlabRepositories));
			for (GitlabRepository g : gitlabRepositories) {
				try {
					this.gitlabRepositoryMapper.insert(g);
				} catch (DuplicateKeyException e2) {
					log.info("DuplicateKeyException ProjectKey:{}, PathWithNamespace:{}", g.getProjectKey(), g.getPathWithNamespace());
					LambdaUpdateWrapper<GitlabRepository> updateWrapper = new LambdaUpdateWrapper<>();
					updateWrapper
						.eq(GitlabRepository::getProjectKey, g.getProjectKey())
						.eq(GitlabRepository::getPathWithNamespace, g.getPathWithNamespace())
						.set(GitlabRepository::getUpdatedAt, new Date());
					this.gitlabRepositoryMapper.update(updateWrapper);
				}
			}
		}
	}
	
	// 逻辑删除仓库信息
	public void deleteGitlabRepository(String projectKey, String pathWithNamespace) {
		LambdaQueryWrapper<GitlabRepository> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper
			.eq(GitlabRepository::getProjectKey, projectKey)
			.eq(GitlabRepository::getPathWithNamespace, pathWithNamespace.trim());
		gitlabRepositoryMapper.delete(queryWrapper);
	}


}
