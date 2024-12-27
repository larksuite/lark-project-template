package com.bytedance.lark_calendar_connector_demo.model.request;

import com.google.gson.annotations.SerializedName;

public class CalendarEventDeleteReq {
    @SerializedName("header")
    private Header header;

    @SerializedName("payload")
    private CalendarEventPayload calendarEventPayload;

    public Header getHeader() {
        return header;
    }

    public void setHeader(Header header) {
        this.header = header;
    }

    public CalendarEventPayload getPayload() {
        return calendarEventPayload;
    }

    public void setPayload(CalendarEventPayload calendarEventPayload) {
        this.calendarEventPayload = calendarEventPayload;
    }
}
