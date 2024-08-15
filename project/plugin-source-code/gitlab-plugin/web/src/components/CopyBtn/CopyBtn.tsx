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

import React, { useEffect, useState } from 'react';
import { IconCopy } from '@douyinfe/semi-icons';
import { Tooltip, Button, Toast } from '@douyinfe/semi-ui';
import { fetchCallbackUrl } from '../../api/service';
import { copyText } from '../../utils';

export default function CopyBtn() {
  const [signature, setSignature] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const context = await window.JSSDK.Context.load();
      const spaceId = context.mainSpace?.id;
      fetchCallbackUrl(spaceId || '').then((res) => {
        const result = res as unknown as { callback: string };
        if (result.callback) {
          setSignature(result.callback);
        }
      });
    })();
  }, []);

  return (
    <Tooltip
      content="用于配置 Gitlab Webhook 的 URL 和 token，详见规则配置页的帮助文档"
      position="bottom"
      showArrow={false}>
      <Button
        icon={<IconCopy style={{ fill: 'white' }} />}
        theme="solid"
        onClick={async () => {
          if (signature) {
            await copyText(signature);
          } else {
            setSignature(null);

            Toast.error({ content: '获取 token 失败' });
          }
        }}>
        复制 URL
      </Button>
    </Tooltip>
  );
}
