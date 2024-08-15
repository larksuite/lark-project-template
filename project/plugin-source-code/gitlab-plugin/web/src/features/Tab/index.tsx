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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Collapse,
  Typography,
  Table,
  Toast,
  Popover,
  Spin,
} from '@douyinfe/semi-ui';
import { getBindings, deleteBindings } from '../../api/service';
import './index.less';
import { IconTreeTriangleRight } from '@douyinfe/semi-icons';
import useSdkContext from '../../hooks/useSdkContext';
import { BriefWorkItem } from '@lark-project/js-sdk';

enum ITabType {
  MR = 1,
  COMMIT,
  BRANCH,
}

const { Text } = Typography;

const formateTime = (time) => {
  const date = new Date(time * 1000);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  return `${y}-${m}-${d}`;
};

const renderUsers = (users) => {
  if (users && !Array.isArray(users)) users = [users];
  const userEmails = users?.map((user) => user.email) || [];
  if (userEmails.length > 1) {
    return (
      <div className="user-cell">
        <Text
          ellipsis={{ showTooltip: true }}
          className="email">
          {userEmails[0]}
        </Text>
        <Popover
          position="top"
          content={
            <div style={{ padding: '12px' }}>
              {userEmails.map((email) => (
                <div>{`${email}`}</div>
              ))}
            </div>
          }>
          <span className="more">{`+${userEmails.length}`}</span>
        </Popover>
      </div>
    );
  } else {
    return <BaseCell>{userEmails[0]}</BaseCell>;
  }
};

const renderTitle = (type, text, record, maxToolTipWidth?) => {
  const { repository = {}, url } = record;
  if (url || repository?.url) {
    const href = {
      [ITabType.MR]: url || repository?.url,
      [ITabType.COMMIT]: `${repository?.url || url}/commit/${
        record?.commit_id
      }`,
      [ITabType.BRANCH]: `${repository?.url || url}/tree/${record?.name}?`,
    };
    return (
      <BaseCell
        className="title-cell link-cell"
        link={{ href: href[type], target: '_blank' }}
        maxToolTipWidth={maxToolTipWidth}>
        {text}
      </BaseCell>
    );
  } else {
    return (
      <BaseCell
        className="title-cell"
        maxToolTipWidth={maxToolTipWidth}>
        {text}
      </BaseCell>
    );
  }
};

const BaseCell = (props) => {
  const { children, maxToolTipWidth } = props;
  return (
    <Text
      ellipsis={{
        showTooltip: {
          opts: {
            content: children,
            style: {
              wordBreak: 'break-all',
              maxWidth: maxToolTipWidth ?? '240px',
            },
          },
        },
      }}
      {...props}
      children={children || '-'}
    />
  );
};

export const Tab = () => {
  const ctx = useSdkContext();
  const [bindings, setBindings] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [activeWorkItem, setActiveWorkItem] = useState<
    BriefWorkItem | undefined
  >();

  useEffect(() => {
    if (ctx?.activeWorkItem) {
      setActiveWorkItem(ctx.activeWorkItem);
    }
  }, [ctx?.activeWorkItem]);

  useEffect(() => {
    if (activeWorkItem) {
      fetchBingdingsData();
    }
  }, [activeWorkItem]);

  const deleteBinding = useCallback(
    (id) => {
      deleteBindings({
        project_key: activeWorkItem?.spaceId,
        work_item_type_key: activeWorkItem?.workObjectId,
        workitem_id: activeWorkItem?.id,
        id,
      })
        .then((res) => {
          fetchBingdingsData();
        })
        .catch((e) => {
          setLoading(false);
          Toast.error(e.message || '请求失败，请稍后重试');
        });
    },
    [activeWorkItem],
  );

  const fetchBingdingsData = useCallback(() => {
    getBindings({
      project_key: activeWorkItem?.spaceId,
      work_item_type_key: activeWorkItem?.workObjectId,
      workitem_id: activeWorkItem?.id,
    })
      .then((res) => {
        if (res.data) {
          setBindings(res.data);
        }
      })
      .then(() => {
        setLoading(false);
      });
  }, [activeWorkItem]);

  const MRColumns: {
    title: string;
    dataIndex: string;
    width: number;
    render: any;
  }[] = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 210,
      render: (text, record, index) => renderTitle(ITabType.MR, text, record),
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 84,
      render: (text, record, index) => <BaseCell>{text}</BaseCell>,
    },
    {
      title: '仓库',
      dataIndex: 'repository',
      width: 84,
      render: (val) => <BaseCell>{val?.path_with_namespace}</BaseCell>,
    },
    {
      title: '原分支',
      dataIndex: 'source_branch',
      width: 84,
      render: (text, record, index) => <BaseCell>{text}</BaseCell>,
    },
    {
      title: '目标分支',
      dataIndex: 'target_branch',
      width: 84,
      render: (text, record, index) => <BaseCell>{text}</BaseCell>,
    },
    {
      title: '作者',
      dataIndex: 'developers',
      width: 132,
      render: (val, record, index) => renderUsers(val),
    },
    {
      title: 'reviewer',
      dataIndex: 'reviewers',
      width: 139,
      render: (val, record, index) => renderUsers(val),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 98,
      render: (val, record, index) => <BaseCell>{formateTime(val)}</BaseCell>,
    },
    {
      title: '',
      width: 65,
      dataIndex: 'deletable',
      // fixed: bindings['merge_request']?.length > 0 ? 'right' : undefined,
      render: (val, record) => (
        <Typography.Text
          className="action"
          link={val}
          disabled={!val}
          onClick={() => val && deleteBinding(record.id)}>
          {'解绑'}
        </Typography.Text>
      ),
    },
  ];

  const RenderCommitTable = [
    {
      // title: bruteTranslate('ID'),
      title: 'ID',
      dataIndex: 'commit_id',
      width: 155,
      render: (text, record, index) =>
        renderTitle(ITabType.COMMIT, text || record?.id || '', record, '185px'),
    },
    {
      title: '提交信息',
      dataIndex: 'message',
      width: 240,
      render: (text, record, index) => <BaseCell>{text}</BaseCell>,
    },
    {
      title: '仓库',
      dataIndex: 'repository',
      width: 131,
      render: (val) => <BaseCell>{val?.path_with_namespace}</BaseCell>,
    },
    {
      title: '分支',
      dataIndex: 'branch',
      width: 120,
      render: (val) => <BaseCell>{val}</BaseCell>,
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 147,
      render: (val, record, index) => renderUsers(val),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 183,
      render: (val, record, index) => <BaseCell>{formateTime(val)}</BaseCell>,
    },
    {
      title: '',
      width: 65,
      dataIndex: 'deletable',
      // fixed: bindings.commit?.length > 0 ? 'right' : false,
      render: (val, record) => (
        <Typography.Text
          className="action"
          link={val}
          disabled={!val}
          onClick={() => val && deleteBinding(record.id)}>
          {'解绑'}
        </Typography.Text>
      ),
    },
  ];

  const RenderBranchTable = [
    {
      title: '分支信息',
      dataIndex: 'name',
      width: 343,
      render: (text, record, index) =>
        renderTitle(ITabType.BRANCH, text, record),
    },
    {
      title: '代码仓库',
      dataIndex: 'repository',
      width: 309,
      render: (text, record, index) => (
        <BaseCell>{text?.path_with_namespace}</BaseCell>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 252,
      render: (val, record, index) => <BaseCell>{formateTime(val)}</BaseCell>,
    },
    {
      width: 65,
      dataIndex: 'deletable',
      // fixed: bindings.branch?.length > 0 ? 'right' : false,
      render: (val, record) => (
        <Typography.Text
          className="action"
          link={val}
          disabled={!val}
          onClick={() => {
            val && deleteBinding(record.id);
          }}>
          {'解绑'}
        </Typography.Text>
      ),
    },
  ];

  const defaultActiveKey = useMemo(() => {
    const keys: string[] = [];
    Object.keys(bindings).forEach((key) => {
      if (bindings[key]?.length > 0) keys.push(key);
    });
    return keys;
  }, [bindings]);

  return (
    <div className="meego-plugin-gitlab-tab-container">
      <Spin spinning={loading}>
        <div className="meego-plugin-gitlab-tab">
          <Collapse
            className={'collapse'}
            expandIconPosition="left"
            defaultActiveKey={defaultActiveKey}
            expandIcon={<IconTreeTriangleRight size={'extra-small'} />}
            collapseIcon={
              <IconTreeTriangleRight
                size={'extra-small'}
                style={{ transform: 'rotate(90deg)' }}
              />
            }>
            <Collapse.Panel
              header={`Pull Request${
                bindings['merge_request']?.length > 0
                  ? ` · ${bindings['merge_request'].length}`
                  : ''
              } `}
              itemKey="merge_request">
              <Table
                bordered
                columns={MRColumns}
                dataSource={bindings['merge_request']}
                scroll={{
                  x: bindings['merge_request']?.length > 0 ? '105%' : '100%',
                }}
                pagination={false}
                empty={'暂无数据'}
              />
            </Collapse.Panel>
            <Collapse.Panel
              header={`Commit${
                bindings?.commit?.length > 0
                  ? ` · ${bindings?.commit.length}`
                  : ''
              } `}
              itemKey="commit">
              <Table
                bordered
                columns={RenderCommitTable}
                dataSource={bindings?.commit}
                scroll={{
                  x: bindings?.commit?.length > 0 ? '105%' : '100%',
                }}
                pagination={false}
                empty={'暂无数据'}
              />
            </Collapse.Panel>
            <Collapse.Panel
              header={`Branch${
                bindings?.branch?.length > 0
                  ? ` · ${bindings.branch.length}`
                  : ''
              } `}
              itemKey="branch">
              <Table
                bordered
                columns={RenderBranchTable}
                dataSource={bindings?.branch}
                scroll={{
                  x: bindings?.branch?.length > 0 ? '105%' : '100%',
                }}
                pagination={false}
                empty={'暂无数据'}
              />
            </Collapse.Panel>
          </Collapse>
        </div>
      </Spin>
      {/* <RenderTip></RenderTip> */}
    </div>
  );
};
