package com.meego.demo.entity;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Demo {

	private Integer id;
	private String name;
	private Integer age;
	private String city;
}
