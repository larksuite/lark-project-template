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
package com.bytedance.infra.lark_open_api;

import com.bytedance.infra.config.LarkAPIConfig;
import com.lark.oapi.Client;
import com.lark.oapi.core.enums.AppType;
import com.lark.oapi.service.calendar.v4.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class LarkOpenAPIAdapter {
    private static final Logger LOG = LoggerFactory.getLogger(LarkOpenAPIAdapter.class);

    private final Client larkClient;

    public LarkOpenAPIAdapter(Client larkClient) {
        this.larkClient = larkClient;
    }

    public LarkOpenAPIAdapter(LarkAPIConfig larkApiConfig) {
        this.larkClient = com.lark.oapi.Client.newBuilder(larkApiConfig.getAppId(), larkApiConfig.getAppSecret())
                .openBaseUrl(larkApiConfig.getBaseUrl())
                .appType(AppType.SELF_BUILT)
                .build();
    }

    public String getCalendarId() throws Exception {
        // get primary calendar if by lark bot
        PrimaryCalendarResp primaryCalendarResp = larkClient.calendar().calendar().primary(
                PrimaryCalendarReq.newBuilder().userIdType("union_id").build());

        if (primaryCalendarResp.success() &&
                primaryCalendarResp.getData() != null &&
                primaryCalendarResp.getData().getCalendars() != null &&
                primaryCalendarResp.getData().getCalendars().length > 0) {
            return primaryCalendarResp.getData().getCalendars()[0].getCalendar().getCalendarId();
        } else {
            LOG.error("get primary calendar code: %{}, error: {}", primaryCalendarResp.getCode(), primaryCalendarResp.getError().getMessage());
            throw new RuntimeException(primaryCalendarResp.getError().getMessage());
        }
    }

    public String createEvent(String calendarId, String summary, String description, Date start, Date end) throws Exception {
        // create event by parameter
        CalendarEvent calendarEvent = CalendarEvent.newBuilder()
                .summary(summary)
                .description(description)
                .startTime(TimeInfo.newBuilder().timestamp(String.valueOf(start.getTime() / 1000)).build())
                .endTime(TimeInfo.newBuilder().timestamp(String.valueOf(end.getTime() / 1000)).build())
                .build();
        CreateCalendarEventResp createCalendarEventResp = larkClient.calendar().calendarEvent().create(
                CreateCalendarEventReq.newBuilder().
                        calendarId(calendarId).
                        userIdType("union_id").
                        calendarEvent(calendarEvent).
                        build()
        );
        if (createCalendarEventResp.success() && createCalendarEventResp.getData() != null && createCalendarEventResp.getData().getEvent() != null) {
            return createCalendarEventResp.getData().getEvent().getEventId();
        } else {
            LOG.error("create event code: %{}, error: {}", createCalendarEventResp.getCode(), createCalendarEventResp.getError().getMessage());
            throw new RuntimeException(createCalendarEventResp.getError().getMessage());
        }
    }

    public void addEventAttendee(String calendarId, String eventId, List<String> mentionUnionIdList) throws Exception {
        // add event attendee by parameter after create event
        ArrayList<CalendarEventAttendee> attendees = new ArrayList<>();
        for (String mention : mentionUnionIdList) {
            CalendarEventAttendee attendee = CalendarEventAttendee.newBuilder()
                    .type("user")
                    .userId(mention)
                    .build();
            attendees.add(attendee);
        }
        CreateCalendarEventAttendeeReq req = CreateCalendarEventAttendeeReq.newBuilder()
                .calendarId(calendarId)
                .eventId(eventId)
                .userIdType("union_id")
                .createCalendarEventAttendeeReqBody(CreateCalendarEventAttendeeReqBody.newBuilder()
                        .attendees(attendees.toArray(new CalendarEventAttendee[0]))
                        .needNotification(true)
                        .build())
                .build();
        CreateCalendarEventAttendeeResp createCalendarEventAttendeeResp = larkClient.calendar().calendarEventAttendee().create(req);
        if (!createCalendarEventAttendeeResp.success()) {
            LOG.error("add event attendee code: %{}, error: {}", createCalendarEventAttendeeResp.getCode(), createCalendarEventAttendeeResp.getError().getMessage());
            throw new RuntimeException(createCalendarEventAttendeeResp.getError().getMessage());
        }
    }

    public void deleteEvent(String calendarId, String eventId) throws Exception {
        // delete event by parameter
        DeleteCalendarEventResp deleteCalendarEventResp =
                larkClient.calendar().calendarEvent().delete(DeleteCalendarEventReq.newBuilder().
                        calendarId(calendarId).
                        eventId(eventId).
                        build()
                );
        if (!deleteCalendarEventResp.success()) {
            LOG.error("delete event code: %{}, error: {}", deleteCalendarEventResp.getCode(), deleteCalendarEventResp.getError().getMessage());
            throw new RuntimeException(deleteCalendarEventResp.getError().getMessage());
        }
    }
}
