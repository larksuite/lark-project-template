import axios from 'axios';
import { PLUGIN_ID } from '../constants';

interface ResWrapper<T = {}> {
  message: string;
  statusCode: number;
  data: T;
}
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem(`${PLUGIN_ID}_token`) || '';
    config.headers['X-TOKEN'] = token;
    return config;
  },
  err => Promise.reject(err),
);
axios.interceptors.response.use(
  function (response) {
    response.data.statusCode = response.data?.status_code;
    delete response.data?.status_code;
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

interface AuthRes {
  code: string;
  state: string;
}
/**
 * Login authentication
 * @param data
 * @returns
 */
export function authAgree(code: string) {
  return axios.get<ResWrapper<AuthRes>>(`/login?code=${code}`).then(res => res.data);
}