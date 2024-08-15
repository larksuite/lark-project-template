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

import { Context } from '@lark-project/js-sdk';
import { useEffect, useState } from 'react';

const sdk = window.JSSDK;

const useSdkContext = () => {
  const [context, setContext] = useState<Context | undefined>();
  useEffect(() => {
    let unwatch: (() => void) | undefined;
    (async () => {
      try {
        const ctx = await sdk.Context.load();
        setContext(ctx);
        unwatch = ctx.watch((nextCtx) => {
          setContext(nextCtx);
        });
      } catch (e) {
        console.error('Failed to load SDK context:', e);
      }
    })();
    return () => {
      unwatch?.();
    };
  }, []);

  return context;
};

export default useSdkContext;
