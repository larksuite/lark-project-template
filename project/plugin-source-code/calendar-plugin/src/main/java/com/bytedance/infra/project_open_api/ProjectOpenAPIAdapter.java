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
package com.bytedance.infra.project_open_api;

import com.bytedance.infra.config.ProjectAPIConfig;
import com.lark.project.Client;
import com.lark.project.service.user.builder.QueryUserDetailReq;
import com.lark.project.service.user.builder.QueryUserDetailResp;
import com.lark.project.service.user.model.UserBasicInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class ProjectOpenAPIAdapter {
    private static final Logger LOG = LoggerFactory.getLogger(ProjectOpenAPIAdapter.class);

    private final Client client;

    public ProjectOpenAPIAdapter(Client client) {
        this.client = client;
    }

    public ProjectOpenAPIAdapter(ProjectAPIConfig projectApiConfig) {
        this.client = com.lark.project.Client.newBuilder(projectApiConfig.getPluginId(), projectApiConfig.getPluginSecret())
                .openBaseUrl(projectApiConfig.getBaseUrl())
                .build();
        ;
    }

    public List<String> getUnionIdByUserKey(List<String> userKeys) throws Exception {
        // translate project user_key to lark union_id
        List<String> unionIds = new ArrayList<>();
        QueryUserDetailResp queryUserDetailResp = this.client.getUserService().queryUserDetail(QueryUserDetailReq.newBuilder().userKeys(userKeys).build(), null);
        if (queryUserDetailResp.success()) {
            for (UserBasicInfo userBasicInfo : queryUserDetailResp.getData()) {
                String unionId = userBasicInfo.getOutID();
                unionIds.add(unionId);
            }
        } else {
            LOG.error("getUnionIdByUserKey failed, code: {}, errMsg: {}", queryUserDetailResp.getErrCode(), queryUserDetailResp.getErrMsg());
            throw new RuntimeException(queryUserDetailResp.getErrMsg());
        }
        return unionIds;
    }
}
