package com.bytedance.infra.config;


import com.google.gson.annotations.SerializedName;

public class LarkAPIConfig {
    @SerializedName("app_id")
    private String appId;
    @SerializedName("app_secret")
    private String appSecret;
    @SerializedName("base_url")
    private String baseUrl;

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getAppSecret() {
        return appSecret;
    }

    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}