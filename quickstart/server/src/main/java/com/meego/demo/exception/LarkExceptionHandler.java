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

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.meego.demo.vo.ResponseVO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

/**
 * 全局的异常处理
 */
@Slf4j
@Configuration
@ControllerAdvice
public class LarkExceptionHandler {

	/**
	 * 自定义业务错误处理
	 * 
	 * @param syApiException
	 * @return
	 */
	@ExceptionHandler(value = LarkException.class)
	@ResponseBody
	public ResponseVO<Object> handleException(LarkException exception) {
		return ErrorInfo.toResponseVO(exception);
	}

	/**
	 * 参数校验
	 * 
	 * @return
	 */
	@Bean
	MethodValidationPostProcessor methodValidationPostProcessor() {
		return new MethodValidationPostProcessor();
	}

	/**
	 * 参数校验错误处理
	 * 
	 * @param exception
	 * @return
	 */
	@ExceptionHandler
	@ResponseBody
	public ResponseVO<Object> handle(ConstraintViolationException exception) {
		StringBuilder stringBuilder = new StringBuilder();
		exception.getConstraintViolations().forEach(x -> stringBuilder.append(x.getMessage()).append("\n"));

		ResponseVO<Object> vo = ErrorInfo.PARAMETERS_ERROR.toResponseVO();
		if (stringBuilder.length() > 0) {
			vo.setMsg(stringBuilder.toString());
		}
		return vo;
	}

	/**
	 * Bean参数校验错误处理
	 * 
	 * @param exception
	 * @return
	 */
	@ExceptionHandler
	@ResponseBody
	public ResponseVO<Object> handleBean(BindException exception) {
		Set<String> errorMsgSet = new HashSet<>();
		for (FieldError fieldError : exception.getFieldErrors()) {
			errorMsgSet.add(camelToUnderscore(fieldError.getField()) + " - " + fieldError.getDefaultMessage());
		}
		return ErrorInfo.PARAMETERS_ERROR.toResponseVO().setData(errorMsgSet);
	}
	
	public String camelToUnderscore(String camelCaseStr) {
        if (!StringUtils.hasLength(camelCaseStr)) {
            return camelCaseStr;
        }
 
        StringBuilder result = new StringBuilder(camelCaseStr.length() * 2);
        int i = 0;
        char[] chars = camelCaseStr.toCharArray();
        for (char c : chars) {
            if (i > 0 && Character.isUpperCase(c)) {
                result.append('_');
            }
            result.append(Character.toLowerCase(c));
            i++;
        }
 
        return result.toString();
    }

	/**
	 * 500状态处理
	 * 
	 * @param exception
	 * @param request
	 * @return
	 */
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ExceptionHandler
	@ResponseBody
	public ResponseVO<Object> allException(Exception exception, HttpServletRequest request) {
		StringBuilder parameters = new StringBuilder();
		if (null != request) {

			parameters.append(request.getRequestURI()).append(";");
			Map<String, String[]> map = request.getParameterMap();
			for (String key : map.keySet()) {
				parameters.append(key).append(":").append(map.get(key)[0]).append(";");
			}
		}

		log.error("allException parameters:{}", parameters.toString(), exception);

		ResponseVO<Object> responseVO = ErrorInfo.DEFAULT_ERROR.toResponseVO();

		return responseVO;
	}
}
