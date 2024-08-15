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

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.meego.demo.service.BindingService;
import com.meego.demo.vo.ResponseVO;
import com.meego.demo.vo.binding.CodeBranchVO;
import com.meego.demo.vo.binding.CodeCommitVO;
import com.meego.demo.vo.binding.CodeMergeRequestVO;

import lombok.Data;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;

/**
 * tab页 BindingController
 */
@Slf4j
@RestController
@RequestMapping(value = "/binding")
@Validated
public class BindingController {

	@Autowired
	private BindingService bindingService;
	
	@Data
	@Accessors(chain = true)
	public static class BindingResponse {
		/**
		 * 分支
		 */
		private List<CodeBranchVO> branch;
		
		/**
		 * 提交
		 */
		private List<CodeCommitVO> commit;
		
		/**
		 * 合并
		 */
		private List<CodeMergeRequestVO> mergeRequest;
	}
	
	/**
	 * 得到 binding 信息
	 * @param projectKey 空间key
	 * @param workItemTypeKey 工作项类型key
	 * @param workiIemId 工作项ID
	 * @return
	 */
	@GetMapping("{projectKey}/{workItemTypeKey}/{workiIemId}/binding")
	public ResponseVO<BindingResponse> getSetting(@PathVariable(value = "projectKey") String projectKey, 
			@PathVariable(value = "workItemTypeKey") String workItemTypeKey, 
			@PathVariable(value = "workiIemId") Long workiIemId) {
		return bindingService.GetBindingList(projectKey, workItemTypeKey, workiIemId);
	}
	
	/**
	 * 删除binding 信息
	 * @param projectKey 空间key
	 * @param workItemTypeKey 工作项类型key
	 * @param workiIemId 工作项ID
	 * @param id bindingId
	 * @return
	 */
	@DeleteMapping("{projectKey}/{workItemTypeKey}/{workiIemId}/binding")
	public ResponseVO<Object> deleteRepositories(@PathVariable(value = "projectKey") String projectKey,
			@PathVariable(value = "workItemTypeKey") String workItemTypeKey, 
			@PathVariable(value = "workiIemId") Long workiIemId,
			@RequestParam(name = "id") String id) {
		bindingService.deleteBinding(projectKey, workItemTypeKey, workiIemId, id);
		return ResponseVO.generateOK();
	}
	
}
