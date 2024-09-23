import axios from 'axios';
import { BASE_URL, AUTHORIZATION } from '../constants';
import { sdkStorage } from './sdkAction';
import { getToken } from './helper';

const request = axios.create({
  baseURL: BASE_URL,
});

request.interceptors.request.use(
  async config => {
    if (!config.url?.startsWith('/authen')) {
      const headers = await getToken();
      config.headers.set(AUTHORIZATION, headers.authorization);
      console.log('request', {
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  err => Promise.reject(err),
);
request.interceptors.response.use(
  async response => {
    console.log('axios-resoponse', response);
    const configUrl = response.config.url;
    if (response.status === 200 && response.data.code !== 0) {
      if (configUrl?.startsWith('/authen')) {
        const jwtStr = response.headers[AUTHORIZATION];
        if (jwtStr) {
          await sdkStorage.setItem(AUTHORIZATION, jwtStr);
        }
      }
    }
    return response;
  },
  error => Promise.reject(error),
);
export { request };
