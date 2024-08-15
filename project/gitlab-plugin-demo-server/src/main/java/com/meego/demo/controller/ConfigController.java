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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lark.project.core.utils.Lists;
import com.meego.demo.config.LarkPropertiesConfiguration;
import com.meego.demo.entity.GitlabRepository;
import com.meego.demo.entity.GitlabSetting;
import com.meego.demo.service.ConfigService;
import com.meego.demo.service.RepositoryService;
import com.meego.demo.service.RuleService;
import com.meego.demo.vo.ResponseVO;
import com.meego.demo.vo.config.RuleVO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;

/**
 * 空间配置Controller
 */
@Slf4j
@RestController
@RequestMapping(value = "/config")
@Validated
public class ConfigController {

	@Autowired
	private ConfigService configService;

	@Autowired
	private RepositoryService repositoryService;

	@Autowired
	private RuleService ruleService;
	
	@Autowired
    private LarkPropertiesConfiguration configuration;
	
	@Data
	@AllArgsConstructor
	class GitlabSettingResponse {
		/**
		 * 回调地址
		 */
		private String callback;
	}
	
	/**
	 * 得到 回调地址
	 * @param projectKey 空间key
	 * @return
	 */
	@GetMapping("{projectKey}/setting")
	public ResponseVO<GitlabSettingResponse> getSetting(@PathVariable(value = "projectKey") String projectKey) {
		GitlabSetting gitlabSetting = configService.getSetting(projectKey);
		return ResponseVO.generateOK(new GitlabSettingResponse(configuration.getCallbackUrl() + "?signature=" + gitlabSetting.getSignature()));
	}

	

	@Data
	@Accessors(chain = true)
	class GitlabRepositoriesResponse {
		/**
		 * 仓库列表
		 */
		private List<GitlabRepository> repositories;
	}
	
	/**
	 * 获取规则内可用仓库列表
	 * 
	 * @param projectKey 空间key
	 * @return
	 */
	@GetMapping("{projectKey}/repository")
	public ResponseVO<GitlabRepositoriesResponse> getRepositories(
			@PathVariable(value = "projectKey") String projectKey) {
		List<GitlabRepository> list = repositoryService.getGitlabRepositories(projectKey);
		return ResponseVO.generateOK(new GitlabRepositoriesResponse().setRepositories(list));
	}

	@Data
	static class GitlabRepositoriesRequest {
		/**
	     * 仓库名称带namespace列表
	     */
		@Valid
	    private List<PathWithNamespaceVO> repositories;
	}
	
	@Data
	public static class PathWithNamespaceVO {
		/**
	     * 仓库名称带namespace
	     */
		@NotBlank
		private String pathWithNamespace;
	}
	
	
	/**
	 * 创建仓库
	 * @param projectKey 空间key
	 * @param res 仓库request
	 * @return
	 */
	@PostMapping("{projectKey}/repository")
	public ResponseVO<Object> saveRepositorie(@PathVariable(value = "projectKey") String projectKey,
			@RequestBody @Validated  GitlabRepositoriesRequest res) {
		repositoryService.saveGitlabRepositorie(projectKey, res.getRepositories());
		return ResponseVO.generateOK();
	}

	/**
	 * 逻辑删除仓库
	 * 
	 * @param projectKey 空间key
	 * @param pathWithNamespace 仓库名称带namespace
	 * @return
	 */
	@DeleteMapping("{projectKey}/repository")
	public ResponseVO<Object> deleteRepositories(@PathVariable(value = "projectKey") String projectKey,
			@RequestParam(name = "path_with_namespace") @NotBlank String pathWithNamespace) {
		repositoryService.deleteGitlabRepository(projectKey, pathWithNamespace);
		return ResponseVO.generateOK();
	}

	
	/**
	 * 获取流转规则
	 * @param projectKey 空间key
	 * @return
	 * @throws Exception
	 */
	@GetMapping("{projectKey}/config")
	public ResponseVO<RuleResponse> getRule(@PathVariable(value = "projectKey") String projectKey) throws Exception {
		List<RuleVO> data = ruleService.getRule(projectKey);
		return ResponseVO.generateOK(new RuleResponse().setData(data));
	}
	
	@Data
	@Accessors(chain = true)
	class RuleResponse {
		/**
		 * 规则列表
		 */
		private List<RuleVO> data;
	}
	
	
	@Data
	static class GitlabRuleRequest {
		@Valid
		@NotNull
		private RuleVO rule;
	}
	
	/**
	 * 保存流转规则
	 * @param res
	 * @return
	 */
	@PostMapping("config")
	public ResponseVO<Object> saveRule(@RequestBody @Validated GitlabRuleRequest res) {
		ruleService.saveRule(res.getRule());
		return ResponseVO.generateOK();
	}
	
	/**
	 * 规则开关
	 * @param id 规则ID
	 * @param enable 开关, false:关闭, true:打开
	 * @return
	 */
	@PostMapping("enable/{id}/{enable}")
	public ResponseVO<Object> enableRule(@PathVariable(value = "id") Long id, @PathVariable(value = "enable") Boolean enable) {
		ruleService.enableRule(id, enable);
		return ResponseVO.generateOK();
	}
	
	/**
	 * 删除规则
	 * @param id 规则ID
	 * @return
	 */
	@DeleteMapping("{id}/config")
	public ResponseVO<Object> deleteRule(@PathVariable(value = "id") Long id) {
		ruleService.deleteRule(id);
		return ResponseVO.generateOK();
	}
	
	@Data
	@AllArgsConstructor
	class EventResponse {
		private List<Event> data;
	}
	
	@Data
	@AllArgsConstructor
	class Event {
		/**
		 * 事件key
		 */
		private String key;
		/**
		 * 事件名称
		 */
		private String name;
	}
	
	/**
	 * 得到操作事件
	 * @return
	 * @throws Exception
	 */
	@GetMapping("events")
	public ResponseVO<EventResponse> events() throws Exception {
		return ResponseVO.generateOK(new EventResponse(Lists.newArrayList(new Event("merge_request", "Merge Request完成"))));
	}
	
}
