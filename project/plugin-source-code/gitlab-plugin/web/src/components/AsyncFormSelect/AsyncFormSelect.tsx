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
import type { OptionProps } from '@douyinfe/semi-ui/lib/es/select';
import { Form } from '@douyinfe/semi-ui';

export type AsyncFormSelectProps = ComponentProps<typeof Form.Select> & {
  fetchData: () => Promise<OptionProps[]>;
};

const AsyncFormSelect: FC<AsyncFormSelectProps> = (props) => {
  const { fetchData, ...rest } = props;
  const [options, setOptions] = useState<OptionProps[]>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      setLoading(true);
      setOptions(undefined);
      try {
        const data = await fetchData();
        setOptions(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchData]);

  return (
    <Form.Select
      {...rest}
      loading={loading}
      optionList={options}
    />
  );
};

export default AsyncFormSelect;
