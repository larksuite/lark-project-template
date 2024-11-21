import axios from 'axios';
import { BASE_URL } from '../constants';
import { getToken } from './helper';

const request = axios.create({
  baseURL: BASE_URL,
});

request.interceptors.request.use(
  async config => {
    const headers = await getToken();
    // Please Add the obtained token to the request header.
    console.log('headers', headers);
    return config;
  },
  err => Promise.reject(err),
);

export { request };
