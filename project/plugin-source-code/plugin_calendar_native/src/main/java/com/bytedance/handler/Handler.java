package com.bytedance.handler;

import com.bytedance.infra.config.JSONConfigLoader;
import com.bytedance.infra.config.ServerConfig;
import com.bytedance.infra.lark_open_api.LarkOpenAPIAdapter;
import com.bytedance.infra.project_open_api.ProjectOpenAPIAdapter;
import com.bytedance.infra.storage.SQLiteSessionFactory;
import com.bytedance.lark_calendar_connector_demo.model.request.CalendarEventCreateReq;
import com.bytedance.lark_calendar_connector_demo.model.request.CalendarEventDeleteReq;
import com.bytedance.lark_calendar_connector_demo.model.response.Response;
import com.bytedance.lark_calendar_connector_demo.service.CalendarPluginService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Handler {
    private static final Logger LOG = LoggerFactory.getLogger(Handler.class);
    private static final String CALENDAR_EVENT_CREATE = "/calendar/event/create";
    private static final String CALENDAR_EVENT_DELETE = "/calendar/event/delete";

    private CalendarPluginService calendarPluginService;

    public Handler() throws Exception {
        // Initialize the handler
        this.initialize();
    }

    @PostMapping(CALENDAR_EVENT_CREATE)
    public Response calendarEventCreate(@RequestBody CalendarEventCreateReq calendarEventCreateReq) {
        try{
            // receive create event action request
            assert calendarEventCreateReq != null;
            this.calendarPluginService.calendarEventCreate(calendarEventCreateReq);
        } catch (Throwable e) {
            LOG.error("calendarEventCreate failed: {}}", e.getMessage());
        }
        return new Response();
    }

    @PostMapping(CALENDAR_EVENT_DELETE)
    public Response calendarEventCreate(@RequestBody CalendarEventDeleteReq calendarEventDeleteReq) {
        try{
            // receive delete event action request
            assert calendarEventDeleteReq != null;
            this.calendarPluginService.calendarEventDelete(calendarEventDeleteReq);
        } catch (Throwable e) {
            LOG.error("calendarEventDelete failed: {}}", e.getMessage());
        }
        return new Response();
    }

    public void initialize() throws Exception {
        try {
            // initialize dependency component and service
            LOG.info("Initialize Handler");

            // config
            JSONConfigLoader loader = new JSONConfigLoader();
            ServerConfig calendarConfig = loader.loadCalendarConfig();

            // project open api sdk
            ProjectOpenAPIAdapter calendarOpenApiAdapter = new ProjectOpenAPIAdapter(calendarConfig.getProjectApiConfig());

            // lark open api sdk
            LarkOpenAPIAdapter calendarLarkOpenApiAdapter = new LarkOpenAPIAdapter(calendarConfig.getLarkApiConfig());

            // sqlite
            SQLiteSessionFactory sessionFactory = new SQLiteSessionFactory();

            // service
            this.calendarPluginService = new CalendarPluginService(calendarLarkOpenApiAdapter, calendarOpenApiAdapter, sessionFactory);
            LOG.info("Load plugin handle service");
        } catch (Exception e) {
            LOG.error("Initialize failed: {}", e.getMessage());
            throw e;
        }
    }
}
