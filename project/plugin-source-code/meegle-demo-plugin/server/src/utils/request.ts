import axios from 'axios';
import { pluginConfig } from '../config';

const request = axios.create({
  baseURL: `${pluginConfig.REQEST_OPENAPI_DOMAIN}/open_api`,
});
request.interceptors.request.use(
  async config => {
    if (!config.url.includes('authen')) {
      return config;
    }
    console.log('axios-request', config);
    return config;
  },
  err => Promise.reject(err),
);
// 响应拦截
request.interceptors.response.use(
  response => {
    console.log('axios-response', response);
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    return Promise.reject(new Error(`HTTP status code ${response.status}`));
  },
  error => {
    // 对响应错误做点什么
    if (error.response) {
      console.error(`HTTP status method ${error.response.config.method}`);
      console.error(`HTTP status headers ${error.response.headers}`);
      // 请求已发送但服务器响应的状态码不在 2xx 范围内
      console.error(`HTTP status code ${error.response.status}`);
      console.error(`HTTP status url ${error.response.config.url}`);
      console.error(`HTTP error data ${JSON.stringify(error.response.data)}`);
    } else {
      // 发生其他错误
      console.error(error.message);
    }
    return Promise.reject(error);
  },
);
export default request;
