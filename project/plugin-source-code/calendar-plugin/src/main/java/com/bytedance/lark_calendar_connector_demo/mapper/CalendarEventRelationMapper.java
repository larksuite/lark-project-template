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
package com.bytedance.lark_calendar_connector_demo.mapper;

import com.bytedance.lark_calendar_connector_demo.model.db.CalendarEventRelation;
import org.apache.ibatis.annotations.*;

import java.util.List;

public interface CalendarEventRelationMapper {
    @Insert("insert into plugin_demo_calendar_event_relation (calendar_id, event_id, project_key, work_item_id) values (#{calendarId}, #{eventId}, #{projectKey},#{workItemId})")
    void insertCalendarEventRelation(CalendarEventRelation calendarEventRelation);

    @Delete("delete from plugin_demo_calendar_event_relation where work_item_id =#{workItemId} and calendar_id = #{calendarId} and project_key =#{projectKey}")
    void deleteCalendarEventRelations(@Param("workItemId") long workItemId, @Param("calendarId") String calendarId, @Param("projectKey") String projectKey);

    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "updatedAt", column = "updated_at"),
            @Result(property = "projectKey", column = "project_key"),
            @Result(property = "workItemId", column = "work_item_id"),
            @Result(property = "calendarId", column = "calendar_id"),
            @Result(property = "eventId", column = "event_id")
    })
    @Select("select * from plugin_demo_calendar_event_relation where work_item_id =#{workItemId} and calendar_id = #{calendarId} and project_key =#{projectKey}")
    List<CalendarEventRelation> selectCalendarEventRelations(@Param("workItemId") long workItemId, @Param("calendarId") String calendarId, @Param("projectKey") String projectKey);
}
