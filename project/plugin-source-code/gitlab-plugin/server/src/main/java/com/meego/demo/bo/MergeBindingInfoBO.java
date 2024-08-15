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

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * MR关联信息
 */
@Data
@Accessors(chain = true)
public class MergeBindingInfoBO {

	/**
	 * MR ID
	 */
	private Integer id;
	
	/**
	 * MR标题
	 */
	private String title;
	
	/**
	 * MR描述
	 */
	private String description;
	
	/**
	 * 目标分支
	 */
	private String targetBranch;
	
	/**
	 * 源分支
	 */
	private String sourceBranch;
	
	/**
	 * mr状态
	 */
	private String state;
	
	/**
	 * mr链接
	 */
	private String url;
	
	/**
	 * 当前操作
	 */
	@JsonIgnore
	private String action;
	
	/**
	 * mr提交人
	 */
	private List<DeveloperBO> developers = new ArrayList<>();
	
	/**
	 * mr reviewer
	 */
	private List<DeveloperBO> reviewers = new ArrayList<>();
	
	/**
	 * mr 合码人
	 */
	private List<DeveloperBO> merger = new ArrayList<>();
	
	/**
	 * mr 创建时间
	 */
	private String createdAt;
	
	/**
	 * Merger
	 */
	private String updatedAt;
}
