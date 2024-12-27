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