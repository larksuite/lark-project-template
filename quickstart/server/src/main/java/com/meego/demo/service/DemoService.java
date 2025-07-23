package com.meego.demo.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lark.project.service.field.model.FieldValuePair;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DemoService {

	@Autowired
	private LarkApiService larkApiService;
	
	public void updateDescriptionField(String projectKey, String workItemType, Long workItemID, String value) throws Exception {
		List<FieldValuePair> updateFields = new ArrayList<>();
		FieldValuePair fieldValuePair = new FieldValuePair();
		fieldValuePair.setFieldKey("description");
		fieldValuePair.setFieldValue("描述通过OpenAPI设置值:" + value + "; 时间: + " + new Date());
		updateFields.add(fieldValuePair);
		// 调用OpenAPI接口
		larkApiService.updateWorkItemField(projectKey, workItemType, workItemID, updateFields);
	}
}
