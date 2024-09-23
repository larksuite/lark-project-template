interface IPLuginEnvConfig {
  PLUGIN_ID: string;
  PLUGIN_SECRET: string;
  REQEST_OPENAPI_DOMAIN: string;
}
const envConfig: IPLuginEnvConfig = {
  PLUGIN_ID: '',
  PLUGIN_SECRET: '',
  REQEST_OPENAPI_DOMAIN: 'https://project.feishu.cn',
};
export const pluginConfig = {
  ...envConfig,
  PLUGIN_TOKEN_TYPE: 0,
};
