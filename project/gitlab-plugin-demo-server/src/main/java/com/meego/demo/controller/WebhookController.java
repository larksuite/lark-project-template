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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.meego.demo.service.WebhookService;
import com.meego.demo.vo.ResponseVO;
import com.meego.demo.vo.webhook.WebhookVO;

import lombok.extern.slf4j.Slf4j;

/**
 * 回调Controller
 */
@Slf4j
@RestController
@RequestMapping(value = "/webhook")
@Validated
public class WebhookController {

	@Autowired
	private WebhookService webhookService;

	/**
	 * gitlab 回调 https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html
	 * @param signature 回调签名
	 * @param data
	 * @return
	 */
	@PostMapping("")
	public ResponseVO<Object> webhook(String signature, @RequestBody WebhookVO data) {
		webhookService.handle(signature, data);
		return ResponseVO.generateOK();
	}
}
