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

package com.meego.demo.exception;

import com.meego.demo.vo.ResponseVO;

import lombok.Getter;
import lombok.Setter;

public enum ErrorInfo {

	
	LARK_SERVICE_ERROR(-7, "lark service error msg: %s"),
	MATCH_RULE_ERROR(-6, "can't match rule with mappingGroup by rule ID: %s"),
	MATCH_REPOSITORY_MAPPING_GROUPID_ERROR(-5, "match RepositoryMapping error: can't find rule with groupID: %s"),
	MATCH_REPOSITORY_MAPPING_CONFIGID_ERROR(-4, "match RepositoryMapping error: can't find rule with configID: %s"),
	PARAMETERS_ERROR(-3, "参数错误"),
    TOKEN_ERROR(-2, "没有相关权限"),
	//默认错误信息
    DEFAULT_ERROR(-1, "系统出错");
	
	
    @Getter
    @Setter
    private int code;
    @Getter
    @Setter
    private String msg;

    private ErrorInfo(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public ResponseVO<Object> toResponseVO() {
        return ResponseVO.generate(msg, code);
    }

    public static ResponseVO<Object> toResponseVO(LarkException vcException) {
        return ResponseVO.generate(vcException.getMsg(), vcException.getErrorInfo().code);
    }
}
