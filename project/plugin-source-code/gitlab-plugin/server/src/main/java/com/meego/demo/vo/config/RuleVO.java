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

package com.meego.demo.vo.config;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 流转规则
 */
@Data
@Accessors(chain = true)
public class RuleVO {
	
	/**
	 * 规则ID
	 */
	private String id;
	
	/**
	 * 空间key
	 */
	@NotBlank
	private String projectKey;
	
	/**
	 * 标题
	 */
	@NotBlank
	private String title;
	
	/**
	 * 是否开启
	 */
	@NotNull
	private Boolean enable;
	
	/**
	 * 工作项
	 */
	@NotNull
	@Valid
	private WorkItemTypeVO workItemType;
	
	/**
	 * 模板
	 */
	@NotNull
	@Valid
	private TemplateVO template;
	
	/**
	 * 映射规则
	 */
	@NotNull
	@Valid
	private List<MappingPairVO> forward;
}