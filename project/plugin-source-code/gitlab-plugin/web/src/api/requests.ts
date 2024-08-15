/**
 * Copyright (2024) Bytedance Ltd. and/or its affiliates
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Toast } from '@douyinfe/semi-ui';
import axios from 'axios';
import { requestHost } from '../constants';

const sdk = window.JSSDK;

const toastCache = {};
const toastCallBack = (e: Error) => {
  if (!Object.prototype.hasOwnProperty.call(toastCache, e.message)) {
    toastCache[e.message] = 1;
    Toast.error({
      content: e.message,
      onClose: () => {
        delete toastCache[e.message];
      },
    });
    console.error(e);
  }
};

const request = axios;

const baseUrl = requestHost;

request.interceptors.request.use(
  async function (config) {
    const token = await sdk.storage.getItem('token');
    if (config.url?.startsWith('/')) {
      config.url = baseUrl + config.url;
    }
    // config.headers['authorization'] = token;
    config.headers['X-GITLAB-PLUGIN-TOKEN'] = token;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  async function (response: { data: any }) {
    try {
      // 在响应之前做一些处理
      const res = response.data;
      if (res.code === 200) {
        return res;
      }
      if (res.code === 1000052203) {
        await sdk.storage.removeItem('token');
        await sdk.storage.removeItem('expire_time');
        return res;
      }
      // 根据返回的业务错误码进行错误处理
      return Promise.reject(
        res.msg ||
          res.error?.localizedMessage?.message ||
          new Error(JSON.stringify(res)),
      );
    } catch (error) {
      // 对响应错误做些什么
      toastCallBack(error);
      return Promise.reject(error);
    }
  },
  function (error: Error) {
    // 对响应错误做些什么
    toastCallBack(error);
    return Promise.reject(error);
  },
);

export default request;
