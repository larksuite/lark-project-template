# 概述
这是飞书项目插件的示例服务代码，内部代码演示了以下内容：
- openapi 鉴权
- openapi 调用
你可以在我们的快速入门指南中找到更多信息
## 1. 安装依赖
```shell
yarn
```
### 2. 配置插件环境
1. 前往 「飞书项目·开发者后台」， 顶部导航切换到「我的插件」tab, 打开相应插件的详情页。
2. 左侧导航切换到「插件功能」tab，https://project.feishu.cn/b/helpcenter/1p8d7djs/359lzbgu , 通过点击 「点击复制以上初始化命令」 操作，查看 plugin-id plugin-secret 以及 site-domain 信息
3. 打开项目文件 `src/config/index.ts` 分别设置 siteDomain、pluginId、pluginSecret
```typescript
const envConfig: IPLuginEnvConfig = {
  PLUGIN_ID: '', // plugin-id
  PLUGIN_SECRET: '', // plugin-secret 
  REQEST_OPENAPI_DOMAIN: 'https://project.feishu.cn',  // site-domian
};
```

## 3. 启动项目
yarn dev