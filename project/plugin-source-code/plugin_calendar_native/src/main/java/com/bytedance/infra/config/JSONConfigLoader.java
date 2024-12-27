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
