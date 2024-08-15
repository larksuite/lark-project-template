package com.meego.demo;

import java.nio.file.Paths;

import org.apache.ibatis.type.JdbcType;

import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.rules.DbColumnType;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;
import com.meego.demo.entity.base.BaseEntity;

public class CodeGeneratorTest {

	public static void main(String[] args) {
		FastAutoGenerator.create(
				"jdbc:mysql://127.0.0.1:3306/demo?useUnicode=true&characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true",
				"root", "bjAY2008")
				.globalConfig(builder -> builder.author("meego")
						.outputDir(Paths.get(System.getProperty("user.dir")) + "/src/main/java")
						.commentDate("yyyy-MM-dd"))
				.dataSourceConfig(builder -> builder.typeConvertHandler((globalConfig, typeRegistry, metaInfo) -> {
					if (JdbcType.TINYINT == metaInfo.getJdbcType()) {
						return DbColumnType.INTEGER;
					}
					return typeRegistry.getColumnType(metaInfo);
				}))
				.packageConfig(
						builder -> builder.parent("com.meego.demo").entity("entity").mapper("mapper").xml("mapper.xml"))
				.strategyConfig(builder -> builder.addInclude("gitlab_code_branch")
						.entityBuilder().enableLombok().enableChainModel().superClass(BaseEntity.class)
						.addSuperEntityColumns("created_at","updated_at","deleted")
						.serviceBuilder().disable()
						.controllerBuilder().disable())
				.templateEngine(new FreemarkerTemplateEngine()).execute();

	}
}
