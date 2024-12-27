package com.bytedance.service;

import com.bytedance.infra.lark_open_api.LarkOpenAPIAdapter;
import com.bytedance.infra.project_open_api.ProjectOpenAPIAdapter;
import com.bytedance.infra.storage.SQLiteSessionFactory;
import com.bytedance.lark_calendar_connector_demo.mapper.CalendarEventRelationMapper;
import com.bytedance.lark_calendar_connector_demo.model.request.CalendarEventCreateReq;
import com.bytedance.lark_calendar_connector_demo.model.request.CalendarEventDeleteReq;
import com.bytedance.lark_calendar_connector_demo.model.request.CalendarEventPayload;
import com.bytedance.lark_calendar_connector_demo.model.request.FieldValue;
import com.bytedance.lark_calendar_connector_demo.model.db.CalendarEventRelation;
import com.bytedance.lark_calendar_connector_demo.service.CalendarPluginService;
import org.apache.ibatis.session.SqlSession;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNotNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarPluginServiceTest {

    @Mock
    private ProjectOpenAPIAdapter projectOpenAPIAdapter;

    @Mock
    private SQLiteSessionFactory sessionFactory;

    @Mock
    private SqlSession sqlSession;

    @Test
    void calendarEventCreateAsync_getCalendarId_fail() throws Exception {
        Map<String, FieldValue> calendarEventCreateReqData = new HashMap<>();
        calendarEventCreateReqData.put("title", new FieldValue("title"));
        calendarEventCreateReqData.put("description", new FieldValue("description"));
        calendarEventCreateReqData.put("start_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("end_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("start_time", new FieldValue("10"));
        calendarEventCreateReqData.put("end_time", new FieldValue("10"));
        List<String> mentionUserKeyList = new ArrayList<>();
        mentionUserKeyList.add("user_key");
        calendarEventCreateReqData.put("mentions", new FieldValue(mentionUserKeyList));

        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventCreateReq calendarEventCreateReq = new CalendarEventCreateReq();
        calendarEventCreateReq.setData(calendarEventCreateReqData);
        calendarEventCreateReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenThrow(new RuntimeException("get calendarId failed"));
        calendarPluginService.calendarEventCreateAsync(calendarEventCreateReq);
    }

    @Test
    void calendarEventCreateAsync_createEvent_fail() throws Exception {
        Map<String, FieldValue> calendarEventCreateReqData = new HashMap<>();
        calendarEventCreateReqData.put("title", new FieldValue("title"));
        calendarEventCreateReqData.put("description", new FieldValue("description"));
        calendarEventCreateReqData.put("start_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("end_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("start_time", new FieldValue("10"));
        calendarEventCreateReqData.put("end_time", new FieldValue("10"));
        List<String> mentionUserKeyList = new ArrayList<>();
        mentionUserKeyList.add("user_key");
        calendarEventCreateReqData.put("mentions", new FieldValue(mentionUserKeyList));

        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventCreateReq calendarEventCreateReq = new CalendarEventCreateReq();
        calendarEventCreateReq.setData(calendarEventCreateReqData);
        calendarEventCreateReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenReturn("calendarId");
        when(larkOpenAPIAdapter.createEvent(eq("calendarId"), eq("title"), eq("description"), isNotNull(), isNotNull())).thenThrow(new RuntimeException("createEvent failed"));
        calendarPluginService.calendarEventCreateAsync(calendarEventCreateReq);
    }

    @Test
    void calendarEventCreateAsync_insertCalendarEventRelation_fail() throws Exception {
        Map<String, FieldValue> calendarEventCreateReqData = new HashMap<>();
        calendarEventCreateReqData.put("title", new FieldValue("title"));
        calendarEventCreateReqData.put("description", new FieldValue("description"));
        calendarEventCreateReqData.put("start_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("end_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("start_time", new FieldValue("10"));
        calendarEventCreateReqData.put("end_time", new FieldValue("10"));
        List<String> mentionUserKeyList = new ArrayList<>();
        mentionUserKeyList.add("user_key");
        calendarEventCreateReqData.put("mentions", new FieldValue(mentionUserKeyList));

        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventCreateReq calendarEventCreateReq = new CalendarEventCreateReq();
        calendarEventCreateReq.setData(calendarEventCreateReqData);
        calendarEventCreateReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenReturn("calendarId");
        when(larkOpenAPIAdapter.createEvent(eq("calendarId"), eq("title"), eq("description"), isNotNull(), isNotNull())).thenReturn("eventId");
        when(sessionFactory.getSession()).thenReturn(sqlSession);
        CalendarEventRelationMapper mapper = Mockito.mock(CalendarEventRelationMapper.class);
        when(sqlSession.getMapper(CalendarEventRelationMapper.class)).thenReturn(mapper);
        doThrow(new IllegalArgumentException("Invalid parameter")).when(mapper).insertCalendarEventRelation(isNotNull());
        calendarPluginService.calendarEventCreateAsync(calendarEventCreateReq);
    }

    @Test
    void calendarEventCreateAsync_addEventAttendee_fail() throws Exception {
        Map<String, FieldValue> calendarEventCreateReqData = new HashMap<>();
        calendarEventCreateReqData.put("title", new FieldValue("title"));
        calendarEventCreateReqData.put("description", new FieldValue("description"));
        calendarEventCreateReqData.put("start_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("end_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("start_time", new FieldValue("10"));
        calendarEventCreateReqData.put("end_time", new FieldValue("10"));
        List<String> mentionUserKeyList = new ArrayList<>();
        mentionUserKeyList.add("user_key");
        calendarEventCreateReqData.put("mentions", new FieldValue(mentionUserKeyList));

        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventCreateReq calendarEventCreateReq = new CalendarEventCreateReq();
        calendarEventCreateReq.setData(calendarEventCreateReqData);
        calendarEventCreateReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenReturn("calendarId");
        when(larkOpenAPIAdapter.createEvent(eq("calendarId"), eq("title"), eq("description"), isNotNull(), isNotNull())).thenReturn("eventId");
        doThrow(new RuntimeException("Test Exception")).when(larkOpenAPIAdapter).addEventAttendee(eq("calendarId"), eq("eventId"), isNotNull());

        when(sessionFactory.getSession()).thenReturn(sqlSession);
        CalendarEventRelationMapper mapper = Mockito.mock(CalendarEventRelationMapper.class);
        when(sqlSession.getMapper(CalendarEventRelationMapper.class)).thenReturn(mapper);
        calendarPluginService.calendarEventCreateAsync(calendarEventCreateReq);
    }

    @Test
    void calendarEventCreateAsync_success() throws Exception {
        Map<String, FieldValue> calendarEventCreateReqData = new HashMap<>();
        calendarEventCreateReqData.put("title", new FieldValue("title"));
        calendarEventCreateReqData.put("description", new FieldValue("description"));
        calendarEventCreateReqData.put("start_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("end_date", new FieldValue(1734624000000D));
        calendarEventCreateReqData.put("start_time", new FieldValue("10"));
        calendarEventCreateReqData.put("end_time", new FieldValue("10"));
        List<String> mentionUserKeyList = new ArrayList<>();
        mentionUserKeyList.add("user_key");
        calendarEventCreateReqData.put("mentions", new FieldValue(mentionUserKeyList));

        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventCreateReq calendarEventCreateReq = new CalendarEventCreateReq();
        calendarEventCreateReq.setData(calendarEventCreateReqData);
        calendarEventCreateReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenReturn("calendarId");
        when(larkOpenAPIAdapter.createEvent(eq("calendarId"), eq("title"), eq("description"), isNotNull(), isNotNull())).thenReturn("eventId");

        when(sessionFactory.getSession()).thenReturn(sqlSession);
        CalendarEventRelationMapper mapper = Mockito.mock(CalendarEventRelationMapper.class);
        when(sqlSession.getMapper(CalendarEventRelationMapper.class)).thenReturn(mapper);
        calendarPluginService.calendarEventCreateAsync(calendarEventCreateReq);
    }

    @Test
    void calendarEventDeleteAsync_getCalendarId_fail() throws Exception {
        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventDeleteReq calendarEventDeleteReq = new CalendarEventDeleteReq();
        calendarEventDeleteReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenThrow(new RuntimeException("get calendarId failed"));
        calendarPluginService.calendarEventDeleteAsync(calendarEventDeleteReq);
    }

    @Test
    void calendarEventDeleteAsync_selectCalendarEventRelations_fail() throws Exception {
        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventDeleteReq calendarEventDeleteReq = new CalendarEventDeleteReq();
        calendarEventDeleteReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);
        when(larkOpenAPIAdapter.getCalendarId()).thenReturn("calendarId");

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        CalendarEventRelationMapper mapper = Mockito.mock(CalendarEventRelationMapper.class);
        when(mapper.selectCalendarEventRelations(eq(1), eq("project_key"), eq("calendarId"))).thenThrow(new RuntimeException("select failed"));

        when(sessionFactory.getSession()).thenReturn(sqlSession);
        when(sqlSession.getMapper(CalendarEventRelationMapper.class)).thenReturn(mapper);

        calendarPluginService.calendarEventDeleteAsync(calendarEventDeleteReq);
    }

    @Test
    void calendarEventDeleteAsync_deleteEvent_fail() throws Exception {
        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventDeleteReq calendarEventDeleteReq = new CalendarEventDeleteReq();
        calendarEventDeleteReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenReturn("calendarId");
        when(sessionFactory.getSession()).thenReturn(sqlSession);
        CalendarEventRelationMapper mapper = Mockito.mock(CalendarEventRelationMapper.class);
        when(sqlSession.getMapper(CalendarEventRelationMapper.class)).thenReturn(mapper);

        List<CalendarEventRelation> calendarEventRelations = new ArrayList<>();
        CalendarEventRelation calendarEventRelation = new CalendarEventRelation();
        calendarEventRelation.setEventId("eventId");
        calendarEventRelations.add(calendarEventRelation);
        when(mapper.selectCalendarEventRelations(eq(1), eq("project_key"), eq("calendarId"))).thenReturn(calendarEventRelations);
        doThrow(new RuntimeException("Test Exception")).when(larkOpenAPIAdapter).deleteEvent(eq("calendarId"), eq("eventId"));
        calendarPluginService.calendarEventDeleteAsync(calendarEventDeleteReq);
    }

    @Test
    void calendarEventDeleteAsync_deleteCalendarEventRelations_fail() throws Exception {
        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventDeleteReq calendarEventDeleteReq = new CalendarEventDeleteReq();
        calendarEventDeleteReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenReturn("calendarId");
        when(sessionFactory.getSession()).thenReturn(sqlSession);
        CalendarEventRelationMapper mapper = Mockito.mock(CalendarEventRelationMapper.class);
        when(sqlSession.getMapper(CalendarEventRelationMapper.class)).thenReturn(mapper);

        List<CalendarEventRelation> calendarEventRelations = new ArrayList<>();
        CalendarEventRelation calendarEventRelation = new CalendarEventRelation();
        calendarEventRelation.setEventId("eventId");
        calendarEventRelations.add(calendarEventRelation);
        when(mapper.selectCalendarEventRelations(eq(1), eq("project_key"), eq("calendarId"))).thenReturn(calendarEventRelations);

        doThrow(new RuntimeException("Test Exception")).when(mapper).deleteCalendarEventRelations(eq(1), eq("calendarId"), eq("project_key"));
        calendarPluginService.calendarEventDeleteAsync(calendarEventDeleteReq);
    }

    @Test
    void calendarEventDeleteAsync_success() throws Exception {
        CalendarEventPayload calendarEventPayload = new CalendarEventPayload();
        calendarEventPayload.setProjectKey("project_key");
        calendarEventPayload.setWorkItemId("1");

        CalendarEventDeleteReq calendarEventDeleteReq = new CalendarEventDeleteReq();
        calendarEventDeleteReq.setPayload(calendarEventPayload);

        LarkOpenAPIAdapter larkOpenAPIAdapter = Mockito.mock(LarkOpenAPIAdapter.class);

        CalendarPluginService calendarPluginService = new CalendarPluginService(larkOpenAPIAdapter, projectOpenAPIAdapter, sessionFactory);

        when(larkOpenAPIAdapter.getCalendarId()).thenReturn("calendarId");
        when(sessionFactory.getSession()).thenReturn(sqlSession);
        CalendarEventRelationMapper mapper = Mockito.mock(CalendarEventRelationMapper.class);
        when(sqlSession.getMapper(CalendarEventRelationMapper.class)).thenReturn(mapper);

        List<CalendarEventRelation> calendarEventRelations = new ArrayList<>();
        CalendarEventRelation calendarEventRelation = new CalendarEventRelation();
        calendarEventRelation.setEventId("eventId");
        calendarEventRelations.add(calendarEventRelation);
        when(mapper.selectCalendarEventRelations(eq(1), eq("project_key"), eq("calendarId"))).thenReturn(calendarEventRelations);
        calendarPluginService.calendarEventDeleteAsync(calendarEventDeleteReq);
    }
}