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

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class RepositoryVO {

	/**
	 * 仓库名称
	 */
	private String name;
	
	/**
	 * 仓库描述
	 */
	private String description;
	
	/**
	 * 仓库主页
	 */
	private String homepage;
	
	/**
	 * 仓库链接
	 */
	private String url;
	
	/**
	 * 仓库名称带namespace
	 */
	@NotBlank
	private String pathWithNamespace;
}



