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

package com.meego.demo.interceptor;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.lark.project.service.plugin.model.UserPluginToken;
import com.meego.demo.exception.ErrorInfo;
import com.meego.demo.service.LoginService;
import com.meego.demo.utils.JsonUtils;
import com.meego.demo.utils.ThreadLocalUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 *  Token 拦截器
 */
@Slf4j
@Component
public class TokenInterceptor implements HandlerInterceptor {

	public static final String TOKEN_HEADER_STRING = "DEMO-PLUGIN-TOKEN";
	
	@Autowired
	private LoginService loginService;
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		String key = request.getHeader(TOKEN_HEADER_STRING);
		if(null != key) {
			Optional<UserPluginToken> optional = loginService.getUserPluginToken(key);
			if(optional.isPresent()) {
				ThreadLocalUtil.set(optional);
			}else {
				setResponse(response);
			}
			return optional.isPresent();
		}
		setResponse(response);
		return false;
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		ThreadLocalUtil.remove(); // 释放ThreadLocal值, 避免内存泄漏
	}
	
	private void setResponse(HttpServletResponse response) throws IOException  {
		response.setCharacterEncoding("UTF-8");
		response.setHeader("Content-type", "application/json;charset=UTF-8");
		String errorInfo = JsonUtils.writeValueAsString((ErrorInfo.TOKEN_ERROR.toResponseVO()));
		response.getWriter().write(errorInfo);
	}

	
}
