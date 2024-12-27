package com.bytedance.infra.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JSONConfigLoaderTest {

    @Test
    void loadCalendarConfig() {
        try {
            JSONConfigLoader loader = new JSONConfigLoader();
            ServerConfig serverConfig = loader.loadCalendarConfig();
            assertNotNull(serverConfig);
            assertNotNull(serverConfig.getLarkApiConfig());
            assertEquals("app_id", serverConfig.getLarkApiConfig().getAppId());
            assertNotNull(serverConfig.getProjectApiConfig());
            assertEquals("plugin_id", serverConfig.getProjectApiConfig().getPluginId());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}