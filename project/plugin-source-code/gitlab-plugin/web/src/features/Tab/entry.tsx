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

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Tab } from './index';
import { isLogin } from '../../accessControl';
import '@douyinfe/semi-ui/dist/css/semi.min.css';

const container = document.createElement('div');
container.id = 'app';
document.body.appendChild(container);
const root = createRoot(container);

// 适配主题模式
window.JSSDK.Context.load().then((ctx) => {
  document.body.setAttribute('theme-mode', ctx.colorScheme);
});

isLogin().then(() => {
  root.render(<Tab />);
});
