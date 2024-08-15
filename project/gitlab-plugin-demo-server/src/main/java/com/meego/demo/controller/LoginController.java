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

package com.meego.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.meego.demo.service.LoginService;
import com.meego.demo.vo.ResponseVO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 登录 Controller
 */
@RestController
@RequestMapping(value = "/login")
@Validated
public class LoginController {

	@Autowired
	private LoginService loginService;

	@Data
	static class LoginRequest {
		/**
		 * code
		 */
		@NotBlank
		private String code;
	}
	
	@Data
	@Accessors(chain = true)
	public static class LoginResponse {
		/**
		 * token 用于 header: authorization
		 */
		private String token;
		/**
		 * 过期时间(秒)
		 */
		private Integer expireTime;
	}
	
	/**
	 * 登录
	 * @param res
	 * @return
	 * @throws Exception
	 */
	@CrossOrigin
	@PostMapping("")
	public ResponseVO<LoginResponse> login(@RequestBody @Validated LoginRequest res) throws Exception {
		LoginResponse loginResponse = loginService.login(res.getCode());
		return ResponseVO.generateOK(loginResponse);
	}
}
