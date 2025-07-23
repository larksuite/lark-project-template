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

package com.meego.demo.utils;

import java.util.Optional;

import com.lark.project.service.plugin.model.UserPluginToken;

/**
 * Token ThreadLocal工具类
 */
public class ThreadLocalUtil {

	private ThreadLocalUtil() {}

	//提供ThreadLocal对象,
	private static final ThreadLocal<Optional<UserPluginToken>> THREAD_LOCAL = new ThreadLocal<>();
	 
    //获取值
    public static Optional<UserPluginToken> get(){
        return THREAD_LOCAL.get();
    }
    
    //存储值
    public static void set(Optional<UserPluginToken> value){
        THREAD_LOCAL.set(value);
    }
 
    //清除ThreadLocal 防止内存泄漏
    public static void remove(){
        THREAD_LOCAL.remove();
    }
    
    public static String getUserKey() {
    	Optional<UserPluginToken> optional = THREAD_LOCAL.get();
    	if(optional != null) {
    		return optional.map(UserPluginToken::getUserKey).orElse("");	
    	}
    	return "";
    }
}
