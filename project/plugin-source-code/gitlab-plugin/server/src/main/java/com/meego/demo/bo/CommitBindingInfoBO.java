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

package com.meego.demo.bo;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 提交关联信息
 */
@Data
@Accessors(chain = true)
public class CommitBindingInfoBO {

	/**
	 * 提交ID
	 */
	private String id;
	
	/**
	 * 交信息
	 */
	private String message;
	
	/**
	 * 提交人
	 */
	private DeveloperBO user;
	
	/**
	 * 提交链接
	 */
	private String url;
	
	/**
	 * commit 创建时间
	 */
	private String timestamp;
	
	/**
	 * 所属分支
	 */
	private String ref;
}

