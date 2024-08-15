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

package com.meego.demo.vo;

import java.io.Serializable;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.meego.demo.exception.ErrorInfo;
import com.meego.demo.utils.JsonUtils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

/**
 * API返回数据VO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
public class ResponseVO<T> implements Serializable{
    private static final long serialVersionUID = 1L;
    
    /**
     * 信息
     */
	private String msg;
	
	/**
	 * 编码
	 */
    private Integer code;
    
    /**
     * 数据
     */
    private T data;

    public ResponseVO(String msg, int code) {
        this.msg = msg;
        this.code = code;
    }

    public static<T> ResponseVO<T> generate(ErrorInfo errorInfo) {
        ResponseVO<T> vo = new ResponseVO<T>(errorInfo.getMsg(), errorInfo.getCode());
        return vo;
    }

    public static <T> ResponseVO<T> generate(String msg, Integer code) {
        ResponseVO<T> vo = new ResponseVO<T>(msg, code);
        return vo;
    }

    public static<T> ResponseVO<T> generateOK() {
        ResponseVO<T> vo = new ResponseVO<T>("OK", 200);
        return vo;
    }

    public static<T> ResponseVO<T> generateOK(T data) {
        ResponseVO<T> vo = new ResponseVO<T>("OK", 200);   
        vo.setData(data);
        return vo;
    }

    public String toJson() {
        try {
            return JsonUtils.objectMapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return "";
    }

}
