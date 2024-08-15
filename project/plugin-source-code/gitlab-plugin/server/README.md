# 飞书项目 Gitlab 插件 Server

Gitlab Plugin Server 基于JAVA 21 编写，使用SpringBoot 3.3.2 框架

## 相关配置 
修改配置文件application.properties以下配置
- spring.datasource.url=数据库连接地址
- spring.datasource.username=数据库用户名
- spring.datasource.password=数据库密码
- lark.plugin-id=飞书插件id
- lark.plugin-secret=飞书插件密钥
- lark.user-key=飞书项目插件负责人的用户key
- lark.callback-url=https://XXXXXX/webhook  回调地址

## 数据库脚本
init.sql