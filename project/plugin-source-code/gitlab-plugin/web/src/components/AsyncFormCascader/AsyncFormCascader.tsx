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

import React, {
  type FC,
  type ComponentProps,
  useState,
  useEffect,
} from 'react';
import { Form, Spin } from '@douyinfe/semi-ui';
import type { CascaderData } from '@douyinfe/semi-ui/lib/es/cascader';

export type AsyncFormCascaderProps = ComponentProps<typeof Form.Cascader> & {
  fetchData: () => Promise<CascaderData[]>;
};

const AsyncFormCascader: FC<AsyncFormCascaderProps> = (props) => {
  const { fetchData, ...rest } = props;
  const [options, setOptions] = useState<CascaderData[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setOptions(undefined);
    try {
      fetchData().then(setOptions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  return (
    <Form.Cascader
      {...rest}
      emptyContent={
        loading ? (
          <Spin
            style={{ width: 80 }}
            tip=""
          />
        ) : (
          <div>暂无数据</div>
        )
      }
      placeholder="请选择工作项或模版"
      treeData={options}
    />
  );
};

export default AsyncFormCascader;
