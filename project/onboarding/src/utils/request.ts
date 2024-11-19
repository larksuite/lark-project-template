import axios from 'axios';
import { BASE_URL } from '../constants';
import { getToken } from './helper';

const request = axios.create({
  baseURL: BASE_URL,
});

request.interceptors.request.use(
  async config => {
    const headers = await getToken();
    // 将获取的 token 添加到请求头中
    console.log('headers', headers);
    return config;
  },
  err => Promise.reject(err),
);

export { request };
