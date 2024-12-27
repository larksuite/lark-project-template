package com.bytedance.lark_calendar_connector_demo.model.request;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.gson.annotations.SerializedName;

public class Header {
    @JsonProperty("operator")
    private String operator;
    @JsonProperty("event_type")
    private String eventType;
    @JsonProperty("token")
    private String token;
    @JsonProperty("uuid")
    private String uuid;

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
}
