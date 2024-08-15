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

package com.meego.demo.service.webhook;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.meego.demo.bo.BranchBindingInfoBO;
import com.meego.demo.bo.CommitBindingInfoBO;
import com.meego.demo.bo.DeveloperBO;
import com.meego.demo.entity.GitlabCodeBranch;
import com.meego.demo.entity.GitlabRepository;
import com.meego.demo.exception.LarkException;
import com.meego.demo.service.WebhookService;
import com.meego.demo.utils.JsonUtils;
import com.meego.demo.vo.webhook.CommitVO;
import com.meego.demo.vo.webhook.WebhookVO;

import lombok.extern.slf4j.Slf4j;

/**
 * 处理 push
 */
@Slf4j
@Component(WebhookService.WEBHOOK + "-" + WebhookService.PUSH)
public class PushWebhookHandlerStrategy extends BaseWebHookHandler implements WebHookHandlerStrategy {

	public static final String HEAD = "refs/heads/";
	
	@Override
	public void handler(String projectKey, WebhookVO data) throws LarkException {
		log.info("push into:{}", projectKey);
		
		GitlabRepository gitlabRepository = this.generateGitlabRepository(projectKey, data.getProject());
		if(null == gitlabRepository) {
			log.warn("projectKey:{}, gitlabRepository is null", projectKey);
			return;
		}
		
		List<GitlabCodeBranch> gitlabCodeBranchs = new ArrayList<>();
		
		// branch逻辑
		if(StringUtils.hasLength(data.getRef())) {
			log.info("branch into ref:{}", data.getRef());
			String ref = this.getRemoveHeadRef(data.getRef());
			Set<Long> workItemIdSet = this.getWorkItemId(ref);
			BranchBindingInfoBO branchBindingInfoBO = this.generateBranchBindingInfoBO(ref, data.getCheckoutSha());
			for (Long workItemId : workItemIdSet) {
				GitlabCodeBranch gitlabCodeBranch = this.generateGitlabCodeBranch(projectKey, 
						workItemId, gitlabRepository.getPathWithNamespace(), BINDING_TYPE_BRANCH, ref, 
						JsonUtils.writeValueAsString(branchBindingInfoBO));
				gitlabCodeBranchs.add(gitlabCodeBranch);
			}
		}
		
		// commits逻辑
		if(null != data.getCommits()) {
			for(CommitVO commitVO : data.getCommits()) {
				Set<Long> workItemIdSet = this.getWorkItemId(commitVO.getMessage());
				CommitBindingInfoBO commitBindingInfoBO = this.generateCommitBindingInfoBO(commitVO, this.getRemoveHeadRef(data.getRef()));
				for (Long workItemId : workItemIdSet) {
					GitlabCodeBranch gitlabCodeBranch = this.generateGitlabCodeBranch(projectKey, 
							workItemId, gitlabRepository.getPathWithNamespace(), BINDING_TYPE_COMMIT, commitVO.getId(), 
							JsonUtils.writeValueAsString(commitBindingInfoBO));
					gitlabCodeBranchs.add(gitlabCodeBranch);
				}
			}
		}
		
		this.saveResult(gitlabRepository, gitlabCodeBranchs);
	}
	
	private String getRemoveHeadRef(String ref) {
		return ref.replace(HEAD, "");
	}

	private BranchBindingInfoBO generateBranchBindingInfoBO(String ref, String checkoutSHA) {
		return new BranchBindingInfoBO().setRef(ref).setCheckoutSHA(checkoutSHA);
	}
	
	private CommitBindingInfoBO generateCommitBindingInfoBO(CommitVO commitVO, String ref) {
		return new CommitBindingInfoBO()
			.setId(commitVO.getId())
			.setMessage(commitVO.getMessage())
			.setUrl(commitVO.getUrl())
			.setTimestamp(commitVO.getTimestamp())
			.setUser(new DeveloperBO(commitVO.getAuthor()))
			.setRef(ref);
	}
	
	
}
