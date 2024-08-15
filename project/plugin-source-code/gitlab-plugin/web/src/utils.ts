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

import { OutOfLimitError } from '@lark-project/js-sdk';

const sdk = window.JSSDK;

export async function copyText(text: string) {
  try {
    await sdk.clipboard.writeText(text);

    sdk.toast.success('复制成功');
  } catch (error) {
    if (error.name === OutOfLimitError.name) {
      sdk.toast.error(error.originMessage);
    } else {
      sdk.toast.error('复制失败');
    }
  }
}

export const getHref = async () => {
  const href = await sdk.navigation.getHref();
  return new URL(href);
};

export const getFlowMode = async (params: {
  spaceId: string;
  workObjectId: string;
}) => {
  const workObj = await sdk.WorkObject.load(params);
  return workObj.flowMode;
};

export const getSpace = async (projectKey: string) => {
  return sdk.Space.load(projectKey);
};
