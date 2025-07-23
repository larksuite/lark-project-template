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


import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.lark.project.service.plugin.model.UserPluginToken;
import com.meego.demo.controller.DemoController.LoginResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LoginService {

	@Autowired
	private LarkApiService larkApiService;
	
	// 本地缓存
	private LoadingCache<String, Optional<UserPluginToken>> cache = CacheBuilder.newBuilder()
	        // 设置写入后的过期时间为2小时-3分钟
	        .expireAfterWrite(7200-180, TimeUnit.SECONDS)
	        // 设置并发级别为10，即同时可以有10个线程并发写入缓存
	        .concurrencyLevel(10)
	        // 设置缓存容量最大为100个键值对
	        .maximumSize(100)
	        .removalListener(l -> log.info("value removal:{}",l))
	        // 构建缓存
	        .build(new CacheLoader<String, Optional<UserPluginToken>>() {
	            // 定义如何加载数据到缓存
	            @Override
	            public Optional<UserPluginToken> load(String key) throws Exception {
	                return Optional.empty(); //过期的key不使用默认加载, 前端重新login
	            }
	        });

	// 用户登录
	public LoginResponse login(String code) throws Exception {
		UserPluginToken userPluginToken = larkApiService.login(code);
		String key = UUID.randomUUID().toString();
		cache.put(key, Optional.ofNullable(userPluginToken));
		return new LoginResponse().setToken(key).setExpireTime(userPluginToken.getExpireTime());
	}
	
	// 得到缓存的token对象
	public Optional<UserPluginToken> getUserPluginToken(String key) {
		try {
			return cache.get(key);
		} catch (ExecutionException e) {
			return null;
		}
	}
}
