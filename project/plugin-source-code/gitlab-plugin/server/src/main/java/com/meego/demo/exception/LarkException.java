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

import lombok.Getter;

public class LarkException extends Exception {

	private static final long serialVersionUID = 1L;

	/**
	 * 错误代码
	 */
	@Getter
	private ErrorInfo errorInfo;
	/**
	 * 错误messageFormat参数
	 */
	@Getter
	private Object[] msgParams;

	private String msg;

	public LarkException(ErrorInfo errorInfo) {
		this.errorInfo = errorInfo;
		this.msg = errorInfo.getMsg();
	}

	public LarkException(ErrorInfo errorInfo, String param) {
		this.errorInfo = errorInfo;
		this.msg = String.format(errorInfo.getMsg(), param);
	}

	public LarkException(ErrorInfo errorInfo, String[] params) {
		this.errorInfo = errorInfo;
		this.msgParams = params;
		this.msg = String.format(errorInfo.getMsg(), msgParams);
	}

	public String getMsg() {
		return msg;
	}
}
