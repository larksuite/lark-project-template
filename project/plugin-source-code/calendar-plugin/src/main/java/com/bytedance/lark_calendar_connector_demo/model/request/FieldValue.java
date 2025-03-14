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
