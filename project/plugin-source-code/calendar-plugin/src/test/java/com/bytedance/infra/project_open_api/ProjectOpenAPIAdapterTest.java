package com.bytedance.infra.project_open_api;

import com.lark.oapi.service.calendar.v4.model.PrimaryCalendarReq;
import com.lark.oapi.service.calendar.v4.model.PrimaryCalendarResp;
import com.lark.oapi.service.calendar.v4.model.PrimaryCalendarRespBody;
import com.lark.oapi.service.calendar.v4.model.UserCalendar;
import com.lark.project.Client;
import com.lark.project.core.request.RequestOptions;
import com.lark.project.service.user.UserService;
import com.lark.project.service.user.builder.QueryUserDetailReq;
import com.lark.project.service.user.builder.QueryUserDetailResp;
import com.lark.project.service.user.model.UserBasicInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectOpenAPIAdapterTest {
    @Mock
    private Client projectClient;

    @Mock
    private UserService userService;

    @Test
    void getUnionIdByUserKey() throws Exception {
        when(projectClient.getUserService()).thenReturn(userService);

        UserBasicInfo userBasicInfo = new UserBasicInfo();
        userBasicInfo.setUserKey("userKey");
        userBasicInfo.setOutID("outId");

        List<UserBasicInfo> respBody = new ArrayList<>();
        respBody.add(userBasicInfo);
        QueryUserDetailResp resp = new QueryUserDetailResp();
        resp.setData(respBody);
        resp.setErrCode(0);
        when(userService.queryUserDetail(isNotNull(), isNull())).thenReturn(resp);

        ProjectOpenAPIAdapter projectOpenAPIAdapter = new ProjectOpenAPIAdapter(projectClient);
        List<String> userKeys = new ArrayList<>();
        userKeys.add("userKey");
        List<String> unionIdByUserKey = projectOpenAPIAdapter.getUnionIdByUserKey(userKeys);

        List<String> expectUnionIds = new ArrayList<>();
        expectUnionIds.add("outId");
        assertLinesMatch(expectUnionIds, unionIdByUserKey);
    }
}