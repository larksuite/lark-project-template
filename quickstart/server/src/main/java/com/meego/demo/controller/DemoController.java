package com.meego.demo.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.meego.demo.entity.Demo;
import com.meego.demo.service.DemoService;
import com.meego.demo.service.LoginService;
import com.meego.demo.vo.ResponseVO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping(value = "/demo")
public class DemoController {
	
	@Autowired
	private DemoService demoService;

	/**
	 * 模拟获取第三方业务数据接口
	 * @return
	 * @throws Exception
	 */
	@GetMapping("getDemoList")
	public Object getDemoList() throws Exception {
		log.info("getDemoList start");
		List<Demo> demos = new ArrayList<>();
		demos.add(new Demo().setId(1).setName("张三").setAge(23).setCity("北京"));
		demos.add(new Demo().setId(2).setName("李四").setAge(24).setCity("上海"));
		demos.add(new Demo().setId(3).setName("王五").setAge(25).setCity("广州"));
		demos.add(new Demo().setId(4).setName("赵六").setAge(26).setCity("深圳"));
		return demos;
	}
	
	@Data
	static class UpdateDescriptionRequest {
		/**
		 * code
		 */
		@NotBlank
		private String projectKey;
		private String workItemTypeKey; 
		private Long workItemID; 
		private String value;
	}
	
	/**
	 * 更新描述字段接口
	 * @param res
	 * @return
	 * @throws Exception
	 */
	@PostMapping("updateDescription")
	public Object updateDescription(@RequestBody @Validated UpdateDescriptionRequest res) throws Exception {
		log.info("updateDescription start");
		demoService.updateDescriptionField(res.getProjectKey(), res.getWorkItemTypeKey(), res.getWorkItemID(), res.getValue());
		return "OK";
	}
	

	@Autowired
	private LoginService loginService;

	@Data
	static class LoginRequest {
		/**
		 * code
		 */
		@NotBlank
		private String code;
	}
	
	@Data
	@Accessors(chain = true)
	public static class LoginResponse {
		/**
		 * token 用于 header: authorization
		 */
		private String token;
		/**
		 * 过期时间(秒)
		 */
		private Integer expireTime;
	}
	
	/**
	 * 登录
	 * @param res
	 * @return
	 * @throws Exception
	 */
	@CrossOrigin
	@PostMapping("login")
	public ResponseVO<LoginResponse> login(@RequestBody @Validated LoginRequest res) throws Exception {
		LoginResponse loginResponse = loginService.login(res.getCode());
		return ResponseVO.generateOK(loginResponse);
	}
	
}
