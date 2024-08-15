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

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.meego.demo.entity.GitlabSetting;
import com.meego.demo.mapper.GitlabSettingMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ConfigService {

	@Autowired
	private GitlabSettingMapper gitlabSettingMapper;
	
	/**
	 * 得到空间配置
	 * @param projectKey
	 * @return
	 */
	public GitlabSetting getSetting(String projectKey) {
		LambdaQueryWrapper<GitlabSetting> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabSetting::getProjectKey, projectKey);
		GitlabSetting gitlabSetting = gitlabSettingMapper.selectOne(queryWrapper, false);
		if(null == gitlabSetting) {
			gitlabSetting = new GitlabSetting();
			gitlabSetting.setProjectKey(projectKey);
			gitlabSetting.setSignature(UUID.nameUUIDFromBytes((projectKey+System.currentTimeMillis()).getBytes()).toString().replace("-", ""));
			try {
				gitlabSettingMapper.insert(gitlabSetting);
			} catch (DuplicateKeyException e) {
				log.warn("DuplicateKeyException projectKey:{}, msg:{}", projectKey, e.getMessage());
				return this.getSetting(projectKey);
			}
		}
		return gitlabSetting;
	}
}
