package com.bytedance.lark_calendar_connector_demo.model.request;

import com.google.gson.annotations.SerializedName;

public class FieldValue {
    @SerializedName("value")
    private Object value;

    public Object getValue() {
        return value;
    }

    public FieldValue() {

    }

    public FieldValue(Object value) {
        this.value = value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}
