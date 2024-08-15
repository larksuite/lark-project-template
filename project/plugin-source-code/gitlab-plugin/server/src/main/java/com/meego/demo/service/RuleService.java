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

package com.meego.demo.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.lark.project.service.field.model.SimpleField;
import com.lark.project.service.project.model.Project;
import com.lark.project.service.workitem.model.WorkItemKeyType;
import com.lark.project.service.workitem_conf.model.StateFlowConfInfo;
import com.lark.project.service.workitem_conf.model.TemplateDetail;
import com.lark.project.service.workitem_conf.model.WorkflowConfInfo;
import com.meego.demo.entity.GitlabTemplateConfig;
import com.meego.demo.entity.GitlabTemplateRepoMapping;
import com.meego.demo.entity.GitlabTemplateStateMapping;
import com.meego.demo.exception.ErrorInfo;
import com.meego.demo.exception.LarkException;
import com.meego.demo.mapper.GitlabTemplateConfigMapper;
import com.meego.demo.mapper.GitlabTemplateRepoMappingMapper;
import com.meego.demo.mapper.GitlabTemplateStateMappingMapper;
import com.meego.demo.utils.JsonUtils;
import com.meego.demo.utils.ThreadLocalUtil;
import com.meego.demo.vo.config.ElementVO;
import com.meego.demo.vo.config.MappingPairVO;
import com.meego.demo.vo.config.MessageVO;
import com.meego.demo.vo.config.RuleVO;
import com.meego.demo.vo.config.TemplateVO;
import com.meego.demo.vo.config.WorkItemTypeVO;
import com.meego.demo.vo.webhook.RepositoryVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class RuleService {

	public static final Integer ControlLevelStrong  = 1; //强制流转控制 必填模式
	public static final Integer ControlLevelWeak  = 2;	//非强制
	
	public static final String MERGE_REQUEST  = "merge_request"; // merge
	
	
	@Autowired
	private GitlabTemplateConfigMapper gitlabTemplateConfigMapper;
	
	@Autowired
	private GitlabTemplateStateMappingMapper gitlabTemplateStateMappingMapper;
	
	@Autowired
	private GitlabTemplateRepoMappingMapper gitlabTemplateRepoMappingMapper;
	
	@Autowired
	private LarkApiService larkApiService;
	
	
	// 得到流转规则
	public List<RuleVO> getRule(String projectKey) throws Exception {
		Map<Long, RuleVO> ruleVOMap = this.getGitlabTemplateConfigList(projectKey);
		log.info("ruleVOMap: {}", JsonUtils.writeValueAsString(ruleVOMap));
		// fill message workItemType template targets
		try {
			Map<Long, Map<String, MappingPairVO>> map = this.getMappingPairVO(projectKey);
			log.info("map: {}", JsonUtils.writeValueAsString(map));
			for (Map.Entry<Long, Map<String, MappingPairVO>> entry : map.entrySet()) {
				Long key = entry.getKey();
				Map<String, MappingPairVO> value = entry.getValue();
				if(ruleVOMap.containsKey(key)) {
					RuleVO ruleVO = ruleVOMap.get(key);
					ruleVO.setForward(new ArrayList<>(value.values()));
					this.fillRule(projectKey, ruleVO);
				}else {
					throw new LarkException(ErrorInfo.MATCH_RULE_ERROR, key.toString());
				}
			}
		} catch (Exception e) {
			log.error("getRule Error", e);
			throw e;
		}
		
		return new ArrayList<RuleVO>(ruleVOMap.values());
	}
	
	public List<RuleVO> getRuleNotFill(String projectKey) throws Exception {
		Map<Long, RuleVO> ruleVOMap = this.getGitlabTemplateConfigList(projectKey);
		// fill message workItemType template targets
		Map<Long, Map<String, MappingPairVO>> map = this.getMappingPairVO(projectKey);
		for (Map.Entry<Long, Map<String, MappingPairVO>> entry : map.entrySet()) {
			Long key = entry.getKey();
			Map<String, MappingPairVO> value = entry.getValue();
			if(ruleVOMap.containsKey(key)) {
				RuleVO ruleVO = ruleVOMap.get(key);
				ruleVO.setForward(new ArrayList<>(value.values()));
			}
		}
		return new ArrayList<RuleVO>(ruleVOMap.values());
	}
	
	// 填充规则检测信息
	private void fillRule(String projectKey, RuleVO ruleVO) throws Exception {
		TemplateDetail templateDetail = this.larkApiService.queryWorkItemTemplateDetail(projectKey, Long.valueOf(ruleVO.getTemplate().getId()));
		if(null != templateDetail) {
			if(LarkApiService.TEMPLATEDETAIL_IS_DISABLED.equals(templateDetail.getIsDisabled())) {
				ruleVO.getTemplate().setMessage(ruleVO.getTemplate().getName() + "已禁用，暂不支持修改规则");
				return;
			}
			ruleVO.getTemplate().setName(templateDetail.getTemplateName());
			
			Map<String, String> stateMap = new HashMap<>();
			if(null != templateDetail.getWorkflowConfs()) {
				for(WorkflowConfInfo confInfo : templateDetail.getWorkflowConfs()) {
					stateMap.put(confInfo.getStateKey(), confInfo.getName());
				}
			}
			if(null != templateDetail.getStateFlowConfs()) {
				for(StateFlowConfInfo confInfo : templateDetail.getStateFlowConfs()) {
					stateMap.put(confInfo.getStateKey(), confInfo.getName());
				}
			}
			
			for(MappingPairVO mappingPairVO : ruleVO.getForward()) {
				StringBuilder builder = new StringBuilder();
				for(ElementVO elementVO : mappingPairVO.getTargets()) {
					if(stateMap.containsKey(elementVO.getKey())) {
						elementVO.setName(stateMap.get(elementVO.getKey()));
					}else {
						builder.append(elementVO.getName()).append("，");
					}
				}
				if(builder.length() > 0) {
					builder.deleteCharAt(builder.length()-1);
					builder.append("已在模板中删除，该规则仅对现存数据生效");
					MessageVO messageVO = new MessageVO();
					messageVO.setTarget(builder.toString());
					mappingPairVO.setMessages(messageVO);
				}
			}
		}else {
			ruleVO.getTemplate().setMessage(ruleVO.getTemplate().getName() + "已删除，当前规则不生效，请删除规则");
		}
	}
	
	// Map<configId, Map<groupId, MappingPairVO>
	private Map<Long, Map<String, MappingPairVO>> getMappingPairVO(String projectKey) throws Exception {
	
		Map<Long, Map<String, MappingPairVO>> resultMap = new HashMap<>();
		
		List<GitlabTemplateStateMapping> gitlabTemplateStateMappings = this.getGitlabTemplateStateMappings(projectKey);
		for (GitlabTemplateStateMapping state : gitlabTemplateStateMappings) {
			if(resultMap.containsKey(state.getConfigId())) {
				Map<String, MappingPairVO> groupMap = resultMap.get(state.getConfigId());
				if(groupMap.containsKey(state.getGroupId())) {
					MappingPairVO mappingPairVO = groupMap.get(state.getGroupId());
					mappingPairVO.getTargets().add(new ElementVO().setKey(state.getTargetKey()).setName(state.getName()).setSignalKey(state.getSignalKey()));
				}else {
					MappingPairVO mappingPairVO = this.generateMappingPairVO(state);
					groupMap.put(state.getGroupId(), mappingPairVO);
				}
			}else {
				Map<String, MappingPairVO> groupMap = new HashMap<>();
				MappingPairVO mappingPairVO = this.generateMappingPairVO(state);
				groupMap.put(state.getGroupId(), mappingPairVO);
				resultMap.put(state.getConfigId(), groupMap);
			}
		}
		
		List<GitlabTemplateRepoMapping> gitlabTemplateRepoMappings = this.getGitlabTemplateRepoMappings(projectKey);
		for (GitlabTemplateRepoMapping repo : gitlabTemplateRepoMappings) {
			if(resultMap.containsKey(repo.getConfigId())) {
				Map<String, MappingPairVO> groupMap = resultMap.get(repo.getConfigId());
				if(groupMap.containsKey(repo.getGroupId())) {
					MappingPairVO mappingPairVO = groupMap.get(repo.getGroupId());
					mappingPairVO.getRepositories().add(new RepositoryVO().setPathWithNamespace(repo.getRepo()));
				}else {
					throw new LarkException(ErrorInfo.MATCH_REPOSITORY_MAPPING_GROUPID_ERROR, repo.getGroupId());
				}
			}else {
				throw new LarkException(ErrorInfo.MATCH_REPOSITORY_MAPPING_CONFIGID_ERROR, repo.getConfigId().toString());
			}
		}
		
		return resultMap;
	}
	
	// 生成
	private MappingPairVO generateMappingPairVO(GitlabTemplateStateMapping state) {
		List<ElementVO> targets = new ArrayList<>();
		targets.add(new ElementVO().setKey(state.getTargetKey()).setName(state.getName()).setSignalKey(state.getSignalKey()));
		ElementVO source = new ElementVO();
		source.setKey(state.getEventType());
		source.setName(state.getEventType());
		
		MappingPairVO mappingPairVO = new MappingPairVO();
		mappingPairVO.setId(state.getGroupId());
		mappingPairVO.setSource(source);
		mappingPairVO.setTargets(targets);
		mappingPairVO.setControlLevel(state.getControlLevel());
		mappingPairVO.setRepositories(new ArrayList<>());
		return mappingPairVO;
	}
	
	// 得到节点状态列表
	private List<GitlabTemplateStateMapping> getGitlabTemplateStateMappings(String projectKey) {
		LambdaQueryWrapper<GitlabTemplateStateMapping> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabTemplateStateMapping::getProjectKey, projectKey);
		return gitlabTemplateStateMappingMapper.selectList(queryWrapper);
	}
	
	// 得到仓库列表
	private List<GitlabTemplateRepoMapping> getGitlabTemplateRepoMappings(String projectKey) {
		LambdaQueryWrapper<GitlabTemplateRepoMapping> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabTemplateRepoMapping::getProjectKey, projectKey);
		return gitlabTemplateRepoMappingMapper.selectList(queryWrapper);
	}
	
	
	// 得到配置列表
	private Map<Long, RuleVO> getGitlabTemplateConfigList(String projectKey) throws Exception {
		Map<Long, RuleVO> resultMap = new HashMap<>();
		LambdaQueryWrapper<GitlabTemplateConfig> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabTemplateConfig::getProjectKey, projectKey);
		List<GitlabTemplateConfig> list = this.gitlabTemplateConfigMapper.selectList(queryWrapper);
		
		List<WorkItemKeyType> workItemKeyTypes = this.larkApiService.queryProjectWorkItemTypes(projectKey);
		if(workItemKeyTypes != null) {
			Map<String, WorkItemKeyType> workItemKeyTypeMap = workItemKeyTypes.stream().collect(Collectors.toMap(WorkItemKeyType::getTypeKey, Function.identity(), (existing, replacement) -> existing));
			for (GitlabTemplateConfig gitlabTemplateConfig : list) {
				RuleVO ruleVO = new RuleVO();
				ruleVO
					.setEnable(gitlabTemplateConfig.getEnable())
					.setId(gitlabTemplateConfig.getId().toString())
					.setTitle(gitlabTemplateConfig.getName())
					.setProjectKey(gitlabTemplateConfig.getProjectKey())
					.setTemplate(new TemplateVO()
							.setId(gitlabTemplateConfig.getTemplateId().toString())
							.setName(gitlabTemplateConfig.getTemplateName())
							.setType(gitlabTemplateConfig.getTemplateType()))
					.setWorkItemType(this.generateWorkItemTypeVO(workItemKeyTypeMap, gitlabTemplateConfig));
				resultMap.put(gitlabTemplateConfig.getId(), ruleVO);
			}
		}
		return resultMap;
	}
	
	// 生成WorkItemTypeVO
	private WorkItemTypeVO generateWorkItemTypeVO(Map<String, WorkItemKeyType> workItemKeyTypeMap, GitlabTemplateConfig gitlabTemplateConfig) {
		WorkItemTypeVO workItemTypeVO = new WorkItemTypeVO()
			.setKey(gitlabTemplateConfig.getWorkItemType())
			.setName(gitlabTemplateConfig.getWorkItemTypeName());
		if(!workItemKeyTypeMap.containsKey(gitlabTemplateConfig.getWorkItemType())) {
			workItemTypeVO.setMessage(gitlabTemplateConfig.getName() + "已删除，当前规则不生效，请删除规则");
			return workItemTypeVO;
		}
		WorkItemKeyType workItemKeyType = workItemKeyTypeMap.get(gitlabTemplateConfig.getWorkItemType());
		if(LarkApiService.WORKITEMKEYTYPE_IS_DISABLE.equals(workItemKeyType.getIsDisable())) {
			workItemTypeVO.setMessage(gitlabTemplateConfig.getName() + "已禁用，暂不支持修改规则");
			return workItemTypeVO;
		}
		workItemTypeVO.setName(workItemKeyType.getName());
		return workItemTypeVO;
	}
	
	// 保存流转规则
	@Transactional
	public void saveRule(RuleVO rule) {
		Map<String, GitlabTemplateStateMapping> stateMap = new HashMap<>();
		if(null != rule.getId()) {
			//清除相关子表
			this.deleteGitlabTemplateStateMapping(Long.valueOf(rule.getId()));
			this.deleteGitlabTemplateRepoMapping(Long.valueOf(rule.getId()));
		}
		
		// 保存配置相关信息逻辑
		GitlabTemplateConfig gitlabTemplateConfig = this.saveGitlabTemplateConfig(rule); 
		for (MappingPairVO mappingPairVO : rule.getForward()) {
			String groupId = UUID.randomUUID().toString();
			this.saveGitlabTemplateStateMapping(gitlabTemplateConfig.getId(), groupId, rule.getProjectKey(), mappingPairVO.getSource(), mappingPairVO.getTargets(), 
					mappingPairVO.getControlLevel(), rule.getTemplate().getId(), stateMap);
			this.saveGitlabTemplateRepoMappings(gitlabTemplateConfig.getId(), groupId, rule.getProjectKey(), mappingPairVO.getRepositories());
		}
		
		// openapi 工作项添加节点
		this.CreateField(rule.getProjectKey(),rule.getWorkItemType().getKey(), rule.getTemplate().getName(), stateMap);
		// 工作流 添加节点 openapi暂时做不了, 手工添加
	}
	
	@Async
	private void CreateField(String projectKey, String workItemType, String templateName, Map<String, GitlabTemplateStateMapping> stateMap) {
		try {
			List<SimpleField> fields = larkApiService.queryWorkItemField(projectKey, workItemType);
			// 工作项字段 alias set
			Set<String> fieldKeySet = fields.stream().filter(f -> StringUtils.hasLength(f.getFieldAlias())).map(f -> f.getFieldAlias()).collect(Collectors.toSet());
			
			for (GitlabTemplateStateMapping stateMapping : stateMap.values()) {
				// 不是强制规则跳过
				if(!ControlLevelStrong.equals(stateMapping.getControlLevel())) {
					continue;
				}
				// 字段已存在的跳过
				if(fieldKeySet.contains(stateMapping.getSignalKey())){
					continue;
				}
				larkApiService.createWorkItemField(projectKey, workItemType, stateMapping.getSignalKey(), templateName, stateMapping.getName());
			}
		} catch (Exception e) {
			log.error("CreateField Error", e);
		}
	}

	// 批量保存仓库相关信息
	private void saveGitlabTemplateRepoMappings(Long configId, String groupId, String projectKey, List<RepositoryVO> repositories) {
		List<GitlabTemplateRepoMapping> gitlabTemplateRepoMappings = new ArrayList<>();
		for (RepositoryVO repositoryVO : repositories) {
			GitlabTemplateRepoMapping gitlabTemplateRepoMapping = new GitlabTemplateRepoMapping();
			gitlabTemplateRepoMapping
				.setConfigId(configId)
				.setGroupId(groupId)
				.setProjectKey(projectKey)
				.setRepo(repositoryVO.getPathWithNamespace());
			gitlabTemplateRepoMappings.add(gitlabTemplateRepoMapping);
		}
		this.gitlabTemplateRepoMappingMapper.insert(gitlabTemplateRepoMappings);
	}
	
	// 批量保存节点相关信息
	private void saveGitlabTemplateStateMapping(Long configId, String groupId, String projectKey, ElementVO source, List<ElementVO> targets, Integer level, String templateId, Map<String, GitlabTemplateStateMapping> stateMap) {
		List<GitlabTemplateStateMapping> gitlabTemplateStateMappings = new ArrayList<>();
		for(ElementVO elementVO : targets) {
			GitlabTemplateStateMapping gitlabTemplateStateMapping = new GitlabTemplateStateMapping();
			gitlabTemplateStateMapping
				.setConfigId(configId)
				.setGroupId(groupId)
				.setProjectKey(projectKey)
				.setEventType(source.getKey())
				.setTargetKey(elementVO.getKey())
				.setName(elementVO.getName())
				.setControlLevel(level);
			if(ControlLevelStrong.equals(level)) {
				gitlabTemplateStateMapping.setSignalKey(templateId + "_" + elementVO.getKey() + "_gitlab");
				stateMap.put(gitlabTemplateStateMapping.getSignalKey(), gitlabTemplateStateMapping);
			}
			gitlabTemplateStateMappings.add(gitlabTemplateStateMapping);
		}
		gitlabTemplateStateMappingMapper.insert(gitlabTemplateStateMappings);
	}

	// 保存模板相关信息
	private GitlabTemplateConfig saveGitlabTemplateConfig(RuleVO rule) {
		GitlabTemplateConfig gitlabTemplateConfig = new GitlabTemplateConfig();
		if(null != rule.getId()) {
			gitlabTemplateConfig.setId(Long.parseLong(rule.getId()));
		}
		gitlabTemplateConfig
			.setProjectKey(rule.getProjectKey())
			.setName(rule.getTitle())
			.setWorkItemType(rule.getWorkItemType().getKey())
			.setWorkItemTypeName(rule.getWorkItemType().getName())
			.setTemplateId(Long.valueOf(rule.getTemplate().getId()))
			.setTemplateName(rule.getTemplate().getName())
			.setTemplateType(rule.getTemplate().getType())
			.setEnable(rule.getEnable());
		gitlabTemplateConfigMapper.insertOrUpdate(gitlabTemplateConfig);
		return gitlabTemplateConfig;
	}
	
	// 删除节点相关信息
	private void deleteGitlabTemplateStateMapping(Long ruleId) {
		LambdaQueryWrapper<GitlabTemplateStateMapping> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabTemplateStateMapping::getConfigId, ruleId);
		gitlabTemplateStateMappingMapper.delete(queryWrapper);
	}
	
	// 删除仓库相关信息
	private void deleteGitlabTemplateRepoMapping(Long ruleId) {
		LambdaQueryWrapper<GitlabTemplateRepoMapping> queryWrapper = new LambdaQueryWrapper<>();
		queryWrapper.eq(GitlabTemplateRepoMapping::getConfigId, ruleId);
		gitlabTemplateRepoMappingMapper.delete(queryWrapper);
	}
	
	/**
	 * 删除规则
	 */
	@Transactional
	public void deleteRule(Long ruleId) {
		if(this.verifyAdminAuth(ruleId)) {
			this.gitlabTemplateConfigMapper.deleteById(ruleId);
			this.deleteGitlabTemplateRepoMapping(ruleId);
			this.deleteGitlabTemplateStateMapping(ruleId);
		}
	}
	
	/**
	 * 规则开关
	 * @param ruleId
	 * @param enable
	 */
	public void enableRule(Long ruleId, Boolean enable) {
		if(this.verifyAdminAuth(ruleId)) {
			LambdaUpdateWrapper<GitlabTemplateConfig> queryWrapper = new LambdaUpdateWrapper<>();
			queryWrapper.eq(GitlabTemplateConfig::getId, ruleId).set(GitlabTemplateConfig::getEnable, enable);
			gitlabTemplateConfigMapper.update(queryWrapper);
		}
	}
	
	// 管理员权验证
	private boolean verifyAdminAuth(Long ruleId) {
		GitlabTemplateConfig templateConfig = gitlabTemplateConfigMapper.selectById(ruleId);
		if(templateConfig != null) {
			String userKey = ThreadLocalUtil.getUserKey();
			if(StringUtils.hasLength(userKey)) {
				try {
					Project project = this.larkApiService.getProjectDetail(templateConfig.getProjectKey(), userKey);
					if(project != null && project.getAdministrators() != null) {
						for(String admin : project.getAdministrators()) {
							if(userKey.equals(admin)) {
								return true;
							}
						}
					}
				} catch (Exception e) {
					log.info("ProjectKey:{}, userKey:{} verifyAdminAuth error msg:{} ", templateConfig.getProjectKey(), userKey, e.getMessage());
					return false;
				}
			}
		}
		return false;
	}
}









