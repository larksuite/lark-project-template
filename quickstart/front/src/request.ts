import axios from 'axios';
import { TOKEN_KEY } from './constants';

const request = axios;

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 添加请求头信息
    const token = await window.JSSDK.storage.getItem(TOKEN_KEY);
    config.headers['DEMO-PLUGIN-TOKEN'] = token || '';
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    console.error(error);
    return Promise.reject(error);
  },
);

export default request;
