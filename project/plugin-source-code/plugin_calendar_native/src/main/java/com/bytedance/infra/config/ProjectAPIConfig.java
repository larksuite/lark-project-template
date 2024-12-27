package com.bytedance.infra.config;

import com.google.gson.annotations.SerializedName;

public class ProjectAPIConfig {
    @SerializedName("plugin_id")
    private String pluginId;
    @SerializedName("plugin_secret")
    private String pluginSecret;
    @SerializedName("base_url")
    private String baseUrl;

    public String getPluginId() {
        return pluginId;
    }

    public void setPluginId(String pluginId) {
        this.pluginId = pluginId;
    }

    public String getPluginSecret() {
        return pluginSecret;
    }

    public void setPluginSecret(String pluginSecret) {
        this.pluginSecret = pluginSecret;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}