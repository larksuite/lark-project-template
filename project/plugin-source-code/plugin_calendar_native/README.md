## 项目介绍
项目是一个日历日程插件demo，使用自动化连接器点位，以提供创建、删除日历日程的自动化操作能力。

### 注意事项
1. 进入本项目前，建议先详细阅读[Connector-自动化连接器](https://project.feishu.cn/b/helpcenter/1p8d7djs/2cnupe2w])
2. 本项目是一个demo应用，以功能展示为核心，不具备业务健壮性。故仅供参考，不建议直接用于生产环境

### 前置准备
1. 飞书项目插件准备 
   1. 创建飞书项目插件 
   2. 使用自动化连接器构成
      1. 创建【创建飞书日程】操作
      2. 创建【删除飞书日程】操作
   3. 发布飞书项目插件
2. 飞书日历准备
   1. 创建飞书应用
   2. 申请飞书日历相关应用权限
   3. 发布应用
### 技术选型
| 技术         | 说明        |
|------------|-----------|
| SpringBoot | API应用开发框架 |
| Maven      | 依赖管理和构建工具 |
| MyBatis    | ORM框架     |
| SQLite     | 持久化存储     |

### 接口说明
|       接口         | 方法   | 功能介绍            | 说明                       |
|------------|------|-----------------|--------------------------|
| /calendar/event/create | POST | 创建飞书日程，并添加会议参与人 | 支持自动化工作项触发器，创建飞书日程并与工作项关联 |
| /calendar/event/delete | POST | 删除飞书日程          | 支持自动化工作项触发器，删除工作项关联的相关日程 |

### 应用配置说明
1. 插件点位配置
在插件开发者后台中，配置如下入参，实现「创建飞书日程」操作
```json
{
   "description": {
      "field_type": "text",
      "form_config": {
         "label": {
            "origin": "描述"
         }
      }
   },
   "end_date": {
      "field_type": "date",
      "form_config": {
         "label": {
            "origin": "结束日期"
         }
      }
   },
   "end_time": {
      "field_type": "select",
      "form_config": {
         "label": {
            "origin": "结束小时"
         }
      },
      "field_attr": {
         "option": {
            "type": "enum",
            "enum": [
               {
                  "label": {
                     "origin": "9:00"
                  },
                  "value": "9"
               },
               {
                  "label": {
                     "origin": "10:00"
                  },
                  "value": "10"
               },
               {
                  "label": {
                     "origin": "11:00"
                  },
                  "value": "11"
               }
            ]
         }
      }
   },
   "mentions": {
      "field_type": "multi_user",
      "form_config": {
         "label": {
            "origin": "日程参与人"
         }
      }
   },
   "start_date": {
      "field_type": "date",
      "form_config": {
         "label": {
            "origin": "开始日期"
         }
      }
   },
   "start_time": {
      "field_type": "select",
      "form_config": {
         "label": {
            "origin": "开始小时"
         }
      },
      "field_attr": {
         "option": {
            "type": "enum",
            "enum": [
               {
                  "label": {
                     "origin": "9:00"
                  },
                  "value": "9"
               },
               {
                  "label": {
                     "origin": "10:00"
                  },
                  "value": "10"
               },
               {
                  "label": {
                     "origin": "11:00"
                  },
                  "value": "11"
               }
            ]
         }
      }
   },
   "title": {
      "field_type": "text",
      "form_config": {
         "label": {
            "origin": "标题"
         }
      }
   }
}
```

2. 应用配置

位于src/main/java/resources/config.json中
```json
{
  "lark_api_config": {
    "app_id": "app_id", //应用ID
    "app_secret": "app_secret",//应用密钥
    "base_url": "base_url"//飞书应用域名
  }, //飞书应用配置
  
  "project_api_config": {
    "plugin_id": "plugin_id",//插件ID
    "plugin_secret": "plugin_secret",//插件密钥
    "base_url": "base_url"//飞书项目应用域名
  }//飞书项目插件配置
}
```
### 启动应用
1.  修改配置文件[config.json](config.json)
2.  启动应用，命令参考如下
```shell
mvn clean package -Dmaven.test.skip=true
java -jar target/plugin-calendar-1.0.jar


