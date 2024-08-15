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

package com.meego.demo.vo.binding;

import com.meego.demo.vo.webhook.RepositoryVO;
import com.meego.demo.vo.webhook.UserVO;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 分支VO
 */
@Data
@Accessors(chain = true)
public class CodeCommitVO {
	
	/**
	 * ID
	 */
	private String id;
	
	/**
	 * 工作项ID
	 */
	private String workItemID;
	
	/**
	 * 是否可删除
	 */
	private Boolean deletable;
	
	/**
	 * 分支名称
	 */
	private String name;
	
	/**
	 * 更新时间
	 */
	private Long updateTime;
	
	/**
	 * 仓库
	 */
	private RepositoryVO repository;
	
	/**
	 * commitID
	 */
	private String commitID;

	/**
	 * 提交信息
	 */
	private String message;

	/**
	 * url
	 */
	private String url;

	/**
	 * 分支
	 */
	private String branch;

	/**
	 * 作者
	 */
	private UserVO author;
}
