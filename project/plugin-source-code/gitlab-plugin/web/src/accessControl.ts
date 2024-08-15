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

import { authAgree } from './api';

const sdk = window.JSSDK;

async function getToken(code: string) {
  try {
    const res = (await authAgree(code)) as unknown as {
      token: string;
      expire_time: number;
    };

    if (!res) {
      return Promise.reject(new Error('Invalid response from authAgree'));
    }
    const { token, expire_time } = res;

    if (!token || !expire_time) {
      return Promise.reject(new Error('Token or expireTime is missing'));
    }
    const currentTime = Date.now();

    const adjustedExpireTime = currentTime + 7200 * 1000 - 5 * 60 * 1000;

    await sdk.storage.setItem('token', token);
    await sdk.storage.setItem('expire_time', adjustedExpireTime.toString());

    return true;
  } catch (error) {
    return false;
  }
}

async function checkLogin() {
  const token = await sdk.storage.getItem('token');
  const expire_time = await sdk.storage.getItem('expire_time');
  if (!token || !expire_time || Number(expire_time) - Number(new Date()) <= 0) {
    return false;
  }
  return true;
}

export async function isLogin() {
  const login = await checkLogin();
  if (!login) {
    const code = await sdk.utils.getAuthCode();
    await getToken(code.code);
  }
}
