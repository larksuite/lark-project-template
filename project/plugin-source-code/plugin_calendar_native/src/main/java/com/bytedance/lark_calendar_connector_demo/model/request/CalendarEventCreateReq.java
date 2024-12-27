package com.bytedance.lark_calendar_connector_demo.model.request;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

public class CalendarEventCreateReq {
    @SerializedName("header")
    private Header header;
    @SerializedName("data")
    private Map<String, FieldValue> data;
    @SerializedName("payload")
    private CalendarEventPayload calendarEventPayload;

    public Header getHeader() {
        return header;
    }

    public void setHeader(Header header) {
        this.header = header;
    }

    public Map<String, FieldValue> getData() {
        return data;
    }

    public void setData(Map<String, FieldValue> data) {
        this.data = data;
    }

    public CalendarEventPayload getPayload() {
        return calendarEventPayload;
    }

    public void setPayload(CalendarEventPayload calendarEventPayload) {
        this.calendarEventPayload = calendarEventPayload;
    }
}
