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

package com.meego.demo.vo.webhook;

import java.util.List;

import lombok.Data;

@Data
public class WebhookVO {

	private String objectKind;
	private String ref;
	private String checkoutSha;
	private String userId;
	private String userName;
	private String userUsername;
	private String userEmail;
	private ProjectVO project;
	private RepositoryVO repository;
	private List<CommitVO> commits;
	private ObjectAttributesVO objectAttributes;
	private UserVO user;

}