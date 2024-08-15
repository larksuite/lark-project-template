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
  type ReactNode,
  type ReactElement,
  useState,
  useEffect,
  useContext,
} from 'react';
import { Empty, Layout, Button, List, Typography } from '@douyinfe/semi-ui';
import { type PaginationProps } from '@douyinfe/semi-ui/lib/es/pagination';
import { type ButtonProps } from '@douyinfe/semi-ui/lib/es/button';
import { type ListProps } from '@douyinfe/semi-ui/lib/es/list';
import { IconPlusCircle } from '@douyinfe/semi-icons';
import { ConfigContext } from '../../context/configContext';
import { fetchConfigList } from '../../api/service';

interface Props<T> extends ListProps<T> {
  onClickAdd: ButtonProps['onClick']; // 新建按钮的点击事件
  title: string; // 标题
  addBtnText: string; // 新建按钮的文案
  headerContent?: ReactNode | null;
  pagination?: false | PaginationProps; // 分页
  forceUpdataFlag: number;
}

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function ConfigList<T extends Record<string, any>>(
  props: Props<T>,
): ReactElement {
  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { setTemplateList } = useContext(ConfigContext);
  const {
    title,
    onClickAdd = () => {},
    addBtnText = '添加流转规则',
    headerContent = null,
    renderItem = (item, i) => i,
    forceUpdataFlag = 0,
    ...rest
  } = props;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { mainSpace } = await window.JSSDK.Context.load();
      fetchConfigList(mainSpace?.id || '').then((res) => {
        const rules = res?.data || [];
        setTemplateList(rules.map((item) => item.template.id));
        setList(rules as any);
        setLoading(false);
      });
    })();
  }, [forceUpdataFlag]);

  return (
    <Layout>
      <Header style={{ display: 'flex', padding: '12px 24px' }}>
        <Title heading={5}>{title}</Title>
        {headerContent && <div style={{ flex: 1 }}>{headerContent}</div>}
        <Button
          icon={<IconPlusCircle />}
          theme="solid"
          onClick={onClickAdd}>
          {addBtnText}
        </Button>
      </Header>
      <Content>
        <List
          loading={loading}
          dataSource={list}
          split={false}
          renderItem={(item: T, i) => (
            <List.Item
              key={item.id || i}
              style={{ display: 'block' }}>
              {renderItem(item, i)}
            </List.Item>
          )}
          emptyContent={
            <Empty
              style={{ marginTop: '10vh' }}
              // size='large'
              title={'暂无数据'}>
              <Text>
                {'请先添加规则，然后再操作'}
                <Text
                  style={{ marginLeft: 4 }}
                  link
                  onClick={onClickAdd}>
                  {addBtnText}
                </Text>
              </Text>
            </Empty>
          }
          {...rest}
        />
      </Content>
    </Layout>
  );
}

// 设置参数默认值
export default ConfigList;
