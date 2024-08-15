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

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lark.project.service.workitem.model.WorkItemKeyType;
import com.lark.project.service.workitem_conf.model.TemplateConf;
import com.lark.project.service.workitem_conf.model.TemplateDetail;
import com.meego.demo.exception.ErrorInfo;
import com.meego.demo.exception.LarkException;
import com.meego.demo.service.LarkApiService;
import com.meego.demo.vo.ResponseVO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * Common Api Controller
 */
@Slf4j
@RestController
@RequestMapping(value = "/common_api")
@Validated
public class CommonApiController {

	@Autowired
	private LarkApiService larkApiService;

	
	
	/**
	 * 获取空间下工作项类型
	 * @param projectKey 空间key
	 * @return
	 * @throws LarkException 
	 */
	@GetMapping("projects/{projectKey}/work_item_types")
	public ResponseVO<List<WorkItemKeyType>> queryProjectWorkItemTypes(@PathVariable(value = "projectKey") String projectKey) throws LarkException {
		List<WorkItemKeyType> data = new ArrayList<>();
		try {
			data = larkApiService.queryProjectWorkItemTypes(projectKey);
		} catch (Exception e) {
			log.info("projectKey:{}, queryWorkItemTemplates error msg:{}", projectKey, e.getMessage());
			throw new LarkException(ErrorInfo.LARK_SERVICE_ERROR, e.getMessage());
		}
		return ResponseVO.generateOK(data);
	}
	
	
	
	/**
	 * 获取工作项下的流程模版列表 request
	 */
	@Data
	static class queryProjectWorkItemTypesRequest {
		/**
		 * 空间key
		 */
		@NotBlank
		private String projectKey;
		/**
		 * 工作项Key
		 */
		@NotBlank
		private String workItemTypeKey;
	}
	
	/**
	 * 获取工作项下的流程模版列表
	 * @param res
	 * @return
	 * @throws LarkException 
	 */
	@PostMapping("query_templates")
	public ResponseVO<List<TemplateConf>> queryProjectWorkItemTypes(@RequestBody @Validated queryProjectWorkItemTypesRequest res) throws LarkException {
		List<TemplateConf> data = new ArrayList<>();
		try {
			data = larkApiService.queryWorkItemTemplates(res.getProjectKey(), res.getWorkItemTypeKey());
		} catch (Exception e) {
			log.info("projectKey:{}, workItemTypeKey:{}, queryWorkItemTemplates error msg:{}", res.getProjectKey(), res.getWorkItemTypeKey(), e.getMessage());
			throw new LarkException(ErrorInfo.LARK_SERVICE_ERROR, e.getMessage());
		}
		return ResponseVO.generateOK(data);
	}
	
	/**
	 * 获取流程模版配置详情 request
	 */
	@Data
	static class queryWorkflowRequest {
		/**
		 * 空间key
		 */
		@NotBlank
		private String projectKey;
		/**
		 * 流程ID
		 */
		@NotNull
		private Long templateId ;
	}
	
	/**
	 * 获取流程模版配置详情
	 * @param res
	 * @return
	 * @throws LarkException 
	 */
	@PostMapping("query_template_detail")
	public ResponseVO<TemplateDetail> queryWorkflow(@RequestBody @Validated queryWorkflowRequest res) throws LarkException {
		TemplateDetail data = null;
			try {
				data = larkApiService.queryWorkItemTemplateDetail(res.getProjectKey(), res.getTemplateId());
			} catch (Exception e) {
				log.info("projectKey:{}, workItemId:{}, queryWorkItemTemplateDetail error msg:{}", res.getProjectKey(), res.getTemplateId(), e.getMessage());
				throw new LarkException(ErrorInfo.LARK_SERVICE_ERROR, e.getMessage());
			}
		return ResponseVO.generateOK(data);
	}
}
