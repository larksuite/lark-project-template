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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.meego.demo.entity.GitlabSetting;
import com.meego.demo.mapper.GitlabSettingMapper;
import com.meego.demo.service.webhook.WebHookHandlerStrategy;
import com.meego.demo.utils.JsonUtils;
import com.meego.demo.vo.webhook.WebhookVO;

import lombok.extern.slf4j.Slf4j;

/**
 * 回调
 */
@Slf4j
@Service
public class WebhookService {

	public static final String WEBHOOK = "webhook";
	
	public static final String PUSH = "push";
	public static final String MERGE_REQUEST = "merge_request";
	
	
	@Autowired
    Map<String, WebHookHandlerStrategy> strategys = new ConcurrentHashMap<>();
	
	@Autowired
	private GitlabSettingMapper gitlabSettingMapper;
	
	@Async
	public void handle(String signature, WebhookVO data) {
		log.info("signature:{}, data:{}", signature, JsonUtils.writeValueAsString(data));
		
		LambdaQueryWrapper<GitlabSetting> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabSetting::getSignature, signature);
		GitlabSetting gitlabSetting = this.gitlabSettingMapper.selectOne(queryWrapper, false);

		if(null == gitlabSetting) {
			log.warn("signature [{}] is not exist", signature);
			return;
		}
		
		//使用策略模式处理不同回调
		WebHookHandlerStrategy strategy = strategys.get(WEBHOOK + "-" + data.getObjectKind());
		if(strategy != null) {
			try {
				strategy.handler(gitlabSetting.getProjectKey(), data);
			}catch (Exception e) {
				log.error("handler error", e);
			}
		}else {
			log.info("{} strategy not exist", data.getObjectKind());
		}
	}
	
	
}
