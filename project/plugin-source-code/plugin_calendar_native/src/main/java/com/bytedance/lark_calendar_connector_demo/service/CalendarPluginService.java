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
package com.bytedance.lark_calendar_connector_demo.service;

import com.bytedance.infra.lark_open_api.LarkOpenAPIAdapter;
import com.bytedance.infra.project_open_api.ProjectOpenAPIAdapter;
import com.bytedance.infra.storage.SQLiteSessionFactory;
import com.bytedance.lark_calendar_connector_demo.model.request.CalendarEventCreateReq;
import com.bytedance.lark_calendar_connector_demo.model.request.CalendarEventDeleteReq;
import com.bytedance.lark_calendar_connector_demo.mapper.CalendarEventRelationMapper;
import com.bytedance.lark_calendar_connector_demo.model.db.CalendarEventRelation;
import com.lark.oapi.core.utils.Jsons;
import org.apache.ibatis.session.SqlSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.concurrent.*;

public class CalendarPluginService {
    private static final Logger LOG = LoggerFactory.getLogger(CalendarPluginService.class);

    private final LarkOpenAPIAdapter larkOpenAPIAdapter;

    private final ProjectOpenAPIAdapter projectOpenAPIAdapter;

    private final SQLiteSessionFactory sessionFactory;

    private static ThreadPoolExecutor threadPool;

    private static final String IGNORE_EVENT_TYPE = "RuleSubscribeEvent";

    public CalendarPluginService(LarkOpenAPIAdapter larkOpenApiAdapter, ProjectOpenAPIAdapter projectOpenApiAdapter, SQLiteSessionFactory sessionFactory) {
        this.larkOpenAPIAdapter = larkOpenApiAdapter;
        this.projectOpenAPIAdapter = projectOpenApiAdapter;
        this.sessionFactory = sessionFactory;
        initThreadPool();
    }

    public static void initThreadPool() {
        int corePoolSize = Runtime.getRuntime().availableProcessors();
        int maximumPoolSize = corePoolSize * 10;
        long keepAliveTime = 60;

        TimeUnit unit = TimeUnit.SECONDS;
        BlockingQueue<Runnable> workQueue = new LinkedBlockingQueue<>(100);
        ThreadFactory threadFactory = new ThreadFactory() {
            private int threadNumber = 1;

            @Override
            public Thread newThread(Runnable r) {
                return new Thread(r, "CrawlerThread-" + threadNumber++);
            }
        };

        threadPool = new ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory, new ThreadPoolExecutor.CallerRunsPolicy());
    }

    public void calendarEventCreate(CalendarEventCreateReq calendarEventCreateReq) {
        String eventType = calendarEventCreateReq.getHeader().getEventType();

        // ignore other type
        if (IGNORE_EVENT_TYPE.equals(eventType)) {
            return;
        }

        // async create lark calendar event
        threadPool.execute(() -> {
            this.calendarEventCreateAsync(calendarEventCreateReq);
        });
    }

    public void calendarEventCreateAsync(CalendarEventCreateReq calendarEventCreateReq) {
        LOG.info("CalendarEventCreate req:{}", Jsons.DEFAULT.toJson(calendarEventCreateReq));

        // get data from auto event
        String projectKey = calendarEventCreateReq.getPayload().getProjectKey();
        String workItemId = calendarEventCreateReq.getPayload().getWorkItemId();
        String summary = calendarEventCreateReq.getData().get("title").getValue().toString();
        String description = calendarEventCreateReq.getData().get("description").getValue().toString();
        long startDate = (long) calendarEventCreateReq.getData().get("start_date").getValue();
        long endDate = (long) calendarEventCreateReq.getData().get("end_date").getValue();
        String startTime = calendarEventCreateReq.getData().get("start_time").getValue().toString();
        String endTime = calendarEventCreateReq.getData().get("end_time").getValue().toString();
        List<String> mentionUserKeyList = (ArrayList<String>) calendarEventCreateReq.getData().get("mentions").getValue();

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date((long) startDate));
        calendar.add(Calendar.HOUR_OF_DAY, Integer.parseInt(startTime));
        Date start = calendar.getTime();

        calendar.setTime(new Date((long) endDate));
        calendar.add(Calendar.HOUR_OF_DAY, Integer.parseInt(endTime));
        Date end = calendar.getTime();

        // get union id by user key
        List<String> mentionUnionIdList = null;
        try {
            mentionUnionIdList = this.projectOpenAPIAdapter.getUnionIdByUserKey(mentionUserKeyList);
        } catch (Exception e) {
            LOG.error("get union id by user key failed:{}", e.getMessage());
        }

        // get primary calendar id for create lark calendar event
        String calendarId;
        try {
            // TODO：主要为了demo，不能作为生产环境的正式代码
            calendarId = larkOpenAPIAdapter.getCalendarId();
        } catch (Exception e) {
            LOG.error("get calender id failed:{}", e.getMessage());
            return;
        }

        // create lark calendar event by calendar and other parameter
        String eventId;
        try {
            eventId = this.larkOpenAPIAdapter.createEvent(calendarId, summary, description, start, end);
        } catch (Exception e) {
            LOG.error("calendarEvent create fail: {}", e.getMessage());
            return;
        }

        // save relation of lark calendar event and project work item id
        try (SqlSession sqlSession = this.sessionFactory.getSession()) {
            CalendarEventRelationMapper calendarEventRelationMapper = sqlSession.getMapper(CalendarEventRelationMapper.class);
            CalendarEventRelation calendarEventRelation = new CalendarEventRelation();
            calendarEventRelation.setCalendarId(calendarId);
            calendarEventRelation.setProjectKey(projectKey);
            calendarEventRelation.setEventId(eventId);
            calendarEventRelation.setWorkItemId(Long.parseLong(workItemId));
            calendarEventRelationMapper.insertCalendarEventRelation(calendarEventRelation);
            LOG.info("save db: {}", Jsons.DEFAULT.toJson(calendarEventRelation));
        } catch (Exception e) {
            LOG.error("calendarEvent create db fail: {}", e.getMessage());
            return;
        }

        // add lark calendar event attendee
        try {
            assert mentionUnionIdList != null;
            this.larkOpenAPIAdapter.addEventAttendee(calendarId, eventId, mentionUnionIdList);
        } catch (Exception e) {
            LOG.error("addEventAttendee fail: {}", e.getMessage());
        }
    }

    public void calendarEventDelete(CalendarEventDeleteReq calendarEventDeleteReq) {
        String eventType = calendarEventDeleteReq.getHeader().getEventType();

        // ignore other type
        if (IGNORE_EVENT_TYPE.equals(eventType)) {
            return;
        }

        // async create lark calendar event
        threadPool.execute(() -> {
            this.calendarEventDeleteAsync(calendarEventDeleteReq);
        });
    }

    public void calendarEventDeleteAsync(CalendarEventDeleteReq calendarEventDeleteReq) {
        LOG.info("calendarEventDeleteReq: {}", Jsons.DEFAULT.toJson(calendarEventDeleteReq));

        // get data from auto event
        String projectKey = calendarEventDeleteReq.getPayload().getProjectKey();
        String workItemId = calendarEventDeleteReq.getPayload().getWorkItemId();

        // get primary calendar id for create lark calendar event
        String calendarId;
        try {
            calendarId = larkOpenAPIAdapter.getCalendarId();
        } catch (Exception e) {
            LOG.error("get calender id failed: {}", e.getMessage());
            return;
        }

        // get relation of lark calendar event and project work item id
        List<CalendarEventRelation> calendarEventRelations = null;
        try (SqlSession sqlSession = this.sessionFactory.getSession()) {
            CalendarEventRelationMapper calendarEventRelationMapper = sqlSession.getMapper(CalendarEventRelationMapper.class);
            calendarEventRelations = calendarEventRelationMapper.selectCalendarEventRelations(Long.parseLong(workItemId), calendarId, projectKey);
            LOG.info("db get calendarEventRelations: {}", Jsons.DEFAULT.toJson(calendarEventRelations));
        } catch (Exception e) {
            LOG.error("calendarEvent query fail: {}", e.getMessage());
        }

        if (calendarEventRelations != null) {
            // delete lark calendar event
            for (CalendarEventRelation calendarEventRelation : calendarEventRelations) {
                try {
                    this.larkOpenAPIAdapter.deleteEvent(calendarId, calendarEventRelation.getEventId());
                } catch (Exception e) {
                    LOG.error("calendarEvent delete fail: {}", e.getMessage());
                }
            }
            try (SqlSession sqlSession = this.sessionFactory.getSession()) {
                CalendarEventRelationMapper calendarEventRelationMapper = sqlSession.getMapper(CalendarEventRelationMapper.class);
                calendarEventRelationMapper.deleteCalendarEventRelations(Long.parseLong(workItemId), calendarId, projectKey);
                LOG.info("delete db success");
            } catch (Exception e) {
                LOG.info("calendarEvent delete fail: {}", e.getMessage());
            }
        }
    }
}
