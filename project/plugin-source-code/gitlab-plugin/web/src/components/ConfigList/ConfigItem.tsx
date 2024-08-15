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

import React, { type FC, useEffect, useState } from 'react';
import {
  Popconfirm,
  Card,
  Row,
  Switch,
  Space,
  Typography,
} from '@douyinfe/semi-ui';

import { IconDelete, IconGitlabLogo } from '@douyinfe/semi-icons';

import logo from '../../assets/logo_meego.png';
import { enableRule } from '../../api/service';
import { IConfigList } from '../../api/types';
import { IconArrowRight } from '@douyinfe/semi-icons';
const { Title } = Typography;

const iconsWrapStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  border: '1px solid rgba(28, 31, 35, 0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const iconsStyle = {
  display: 'block',
  height: '26px',
  width: '30px',
  margin: '6px auto 6px',
  filter: 'gray',
};

const ConfigItem: FC<
  IConfigList & {
    onRemove: (id: string) => void;
    onEdit: (IConfigList) => void;
  }
> = (props) => {
  const { onRemove, onEdit, ...rest } = props;
  const [invalid, setInvalid] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const removeConfig = (id: string) => {
    onRemove(id);
  };
  useEffect(() => {
    if (rest.work_item_type.message || rest.template.message) {
      setInvalid(true);
      setTitle(rest.work_item_type.message || rest.template.message || '');
    }
  }, [rest.work_item_type.message, rest.template.message]);

  const Icons = ({ icon }) => (
    <div style={iconsWrapStyle}>
      <img
        src={icon}
        style={{ ...iconsStyle, filter: invalid ? 'grayscale(100%)' : 'none' }}
      />
    </div>
  );

  return (
    <div
      onClick={() => {
        !invalid && onEdit(rest);
      }}>
      <Card
        shadows={invalid ? undefined : 'hover'}
        style={{
          marginBottom: 16,
          position: 'relative',
          background: invalid
            ? 'var(--semi-color-fill-0)'
            : 'var(--semi-color-bg-0)',
        }}
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Row
              type="flex"
              justify="start"
              align="top">
              <div style={iconsWrapStyle}>
                <IconGitlabLogo size="extra-large" />
              </div>
              <div
                style={{ margin: 'auto 10px auto 10px' }}
                className="flex-hor-center">
                <IconArrowRight size="extra-large" />
              </div>
              <Icons icon={logo} />
            </Row>
            <Space>
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                <Switch
                  loading={loading}
                  defaultChecked={props?.enable}
                  onChange={async (value) => {
                    setLoading(true);
                    try {
                      await enableRule(props?.id, value);
                    } catch (error) {
                      console.error('Error enabling rule:', error);
                    } finally {
                      setLoading(false);
                    }
                  }}></Switch>
              </div>
              <Popconfirm
                stopPropagation
                title={'是否删除该映射关系？'}
                content={'一旦删除，该操作将不可逆'}
                cancelText={'取消'}
                okText={'删除'}
                onConfirm={() => removeConfig(props.id)}>
                <IconDelete
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{
                    fontSize: 24,
                    cursor: 'pointer',
                    color: 'rgba(var(--semi-grey-9), .35)',
                  }}
                />
              </Popconfirm>
            </Space>
          </div>
        }>
        <Title heading={6}>
          {invalid
            ? title
            : `GitLab 关联 ${props.work_item_type.name} -> ${props.template.name}`}
        </Title>
      </Card>
    </div>
  );
};

// `GitLab 关联 ${props.work_item_type.name} -> ${props.template.name}`

export default ConfigItem;
