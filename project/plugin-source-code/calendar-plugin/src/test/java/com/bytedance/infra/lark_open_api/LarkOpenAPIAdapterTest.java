package com.bytedance.infra.lark_open_api;

import com.lark.oapi.Client;
import com.lark.oapi.service.calendar.CalendarService;
import com.lark.oapi.service.calendar.v4.model.*;
import com.lark.oapi.service.calendar.v4.resource.Calendar;
import com.lark.oapi.service.calendar.v4.resource.CalendarEvent;
import com.lark.oapi.service.calendar.v4.resource.CalendarEventAttendee;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;

import java.util.ArrayList;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LarkOpenAPIAdapterTest {
    @Mock
    private Client larkClient;

    @Mock
    private CalendarService calendarService;

    @Mock
    private Calendar calendar;

    @Mock
    private CalendarEvent calendarEvent;

    @Mock
    private CalendarEventAttendee calendarEventAttendee;

    @org.junit.jupiter.api.Test
    void getCalendarId() throws Exception {
        when(larkClient.calendar()).thenReturn(calendarService);

        when(calendarService.calendar()).thenReturn(calendar);

        PrimaryCalendarRespBody respBody = new PrimaryCalendarRespBody();
        respBody.setCalendars(new UserCalendar[]{
                UserCalendar.
                        newBuilder().
                        calendar(com.lark.oapi.service.calendar.v4.model.Calendar.
                                newBuilder().
                                calendarId("calendarId").
                                build()
                        ).build()
        });
        PrimaryCalendarResp resp = new PrimaryCalendarResp();
        resp.setData(respBody);

        when(calendar.primary(any(PrimaryCalendarReq.class))).thenReturn(resp);

        LarkOpenAPIAdapter larkOpenAPIAdapter = new LarkOpenAPIAdapter(larkClient);
        String calendarId = larkOpenAPIAdapter.getCalendarId();
        assertEquals("calendarId", calendarId);
    }

    @org.junit.jupiter.api.Test
    void createEvent() throws Exception {
        when(larkClient.calendar()).thenReturn(calendarService);

        when(calendarService.calendarEvent()).thenReturn(calendarEvent);

        CreateCalendarEventRespBody respBody = new CreateCalendarEventRespBody();
        respBody.setEvent(
                com.lark.oapi.service.calendar.v4.model.CalendarEvent.
                        newBuilder().
                        eventId("eventId").
                        build()
        );
        CreateCalendarEventResp resp = new CreateCalendarEventResp();
        resp.setData(respBody);

        when(calendarEvent.create(any(CreateCalendarEventReq.class))).thenReturn(resp);

        LarkOpenAPIAdapter larkOpenAPIAdapter = new LarkOpenAPIAdapter(larkClient);
        String eventId = larkOpenAPIAdapter.createEvent("calendarId", "summary", "description", new Date(), new Date());
        assertEquals("eventId", eventId);
    }

    @org.junit.jupiter.api.Test
    void addEventAttendee() throws Exception {
        when(larkClient.calendar()).thenReturn(calendarService);

        when(calendarService.calendarEventAttendee()).thenReturn(calendarEventAttendee);

        CreateCalendarEventAttendeeRespBody respBody = new CreateCalendarEventAttendeeRespBody();
        CreateCalendarEventAttendeeResp resp = new CreateCalendarEventAttendeeResp();
        resp.setData(respBody);

        when(calendarEventAttendee.create(any(CreateCalendarEventAttendeeReq.class))).thenReturn(resp);

        LarkOpenAPIAdapter larkOpenAPIAdapter = new LarkOpenAPIAdapter(larkClient);
        larkOpenAPIAdapter.addEventAttendee("calendarId", "eventId", new ArrayList<>());
    }

    @org.junit.jupiter.api.Test
    void deleteEvent() throws Exception {
        when(larkClient.calendar()).thenReturn(calendarService);

        when(calendarService.calendarEvent()).thenReturn(calendarEvent);

        DeleteCalendarEventResp resp = new DeleteCalendarEventResp();

        when(calendarEvent.delete(any(DeleteCalendarEventReq.class))).thenReturn(resp);

        LarkOpenAPIAdapter larkOpenAPIAdapter = new LarkOpenAPIAdapter(larkClient);
        larkOpenAPIAdapter.deleteEvent("calendarId", "eventId");
    }
}