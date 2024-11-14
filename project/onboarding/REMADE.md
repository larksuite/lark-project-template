# 概述
这是飞书项目插件的示例，内部代码演示了以下内容：

- 如何从 js-sdk 获取并展示数据

- 各个功能点位的基本使用示例，包含了 Board、Button、Config、Dashboard;

你可以在我们的快速入门指南中找到更多信息
## 环境配置
### 插件基础环境
1. 前往 「飞书项目·开发者后台」， 顶部导航切换到「我的插件」tab, 打开相应插件的详情页。
2. 左侧导航切换到「插件功能」tab，https://project.feishu.cn/b/helpcenter/1p8d7djs/359lzbgu , 通过点击 「点击复制以上初始化命令」 操作，查看 plugin-id plugin-secret 以及 site-domain 信息
3. 通过 lpm config set 分别设置 siteDomain、pluginId、pluginSecret 更详细步骤可以参考 [设置插件基础配置示例](#设置插件基础配置示例)

### 点位信息的相关配置
>项目目录: src/constants/index.ts
1. 配置 REQUEST_DOMAIN (可选: 默认根据配置的 siteDomain 访问示例的服务端接口);
2. 配置 DASH_BOARD_KEY (可选: 插件构成， tab 点位的 key);
    > 配置路径: 
    1. 相应插件的详情页, 左侧导航切换到「插件功能」tab， 点击「添加构成操作」，选中详情页 tab 点位，确认;
    2. 点击详情 tab 的去配置查看 tab 点位的 key
3. 配置点位对应的 resourceId, 并同步到 plugin.config.json 的 resources 配置项的 id 配置;
    > 配置路径: 
    1. 相应插件的详情页, 左侧导航切换到「插件功能」tab， 选中「添加构成」选中对应点位, 确认;
    2. 点击相应点位的「去配置」配置 resourceId;

## 启动项目
1. npm install 安装依赖
1. 在项目目录下运行：`npm start`

2. 然后访问「飞书项目·开发者后台」首页，在页面左下角启用插件的本地调试模式。

3. 最后打开「飞书项目」，预览插件的效果。

## 发布你的插件
1. 在终端上运行 `npm run release` 命令来构建产物并上传。

2. 打开「飞书项目·开发者后台」相应插件详情页。

3. 左侧导航切换到「插件功能」tab，添加对应功能构成并完善配置。

4. 左侧导航切换到「插件发布」tab。

5. 点击「创建版本」填写相关信息，在「产物版本』中选择对应版本产物并提交。

6. 回到「插件发布」页面，会出现一条新增的版本记录，点击该记录的「申请发布」按钮。

7. 恭喜，你现在已经成功发布了一个插件，可以回到「飞书项目」插件市场去安装并尽情使用啦！

## 设置插件基础配置示例

``` bash
 # 「点击复制以上初始化命令」结果示例
 ：' npx @lark-project/cli@latest init project-name MII_xxxxx A06xxxxx --site-domain https://project.feishu.cn
 '
# 设置 siteDomain
lpm config set siteDomain https://project.feishu.cn

# 设置 pluginId
lpm config set pluginId MII_xxxxx

# 设置 pluginSecret
lpm config set pluginSecret  A06xxxxx
```