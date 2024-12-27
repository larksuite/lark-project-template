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
