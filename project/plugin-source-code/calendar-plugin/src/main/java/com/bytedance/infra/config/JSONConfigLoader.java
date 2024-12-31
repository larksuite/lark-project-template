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
package com.bytedance.infra.config;

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

public class JSONConfigLoader {
    private static final Logger LOG = LoggerFactory.getLogger(JSONConfigLoader.class);

    private static final String CONFIG_FILE_PATH = "config.json";

    public JSONConfigLoader() throws Exception {
    }

    public ServerConfig loadCalendarConfig() throws Exception {
        // get config from json file
        BufferedReader reader = null;
        try {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream(CONFIG_FILE_PATH);
            assert inputStream != null;
            reader = new BufferedReader(new InputStreamReader(inputStream));
            Gson gson = new Gson();
            ServerConfig serverConfig = gson.fromJson(reader, ServerConfig.class);
            LOG.info("Load Calendar Config: {}, {}", serverConfig.getLarkApiConfig().getAppId(), serverConfig.getProjectApiConfig().getPluginId());
            return serverConfig;
        } finally {
            if (reader != null) {
                reader.close();
            }
        }
    }
}
