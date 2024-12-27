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
package com.bytedance.infra.config;

import com.google.gson.annotations.SerializedName;

public class ServerConfig {
    @SerializedName("lark_api_config")
    private LarkAPIConfig larkApiConfig;
    @SerializedName("project_api_config")
    private ProjectAPIConfig projectApiConfig;

    public LarkAPIConfig getLarkApiConfig() {
        return this.larkApiConfig;
    }

    public void setLarkApiConfig(LarkAPIConfig larkApiConfig) {
        this.larkApiConfig = larkApiConfig;
    }

    public ProjectAPIConfig getProjectApiConfig() {
        return this.projectApiConfig;
    }

    public void setProjectApiConfig(ProjectAPIConfig projectApiConfig) {
        this.projectApiConfig = projectApiConfig;
    }

    public ServerConfig() {

    }

    public ServerConfig(LarkAPIConfig larkApiConfig, ProjectAPIConfig projectApiConfig) {
        this.larkApiConfig = larkApiConfig;
        this.projectApiConfig = projectApiConfig;
    }
}