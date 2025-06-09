import { ReactElement, useEffect, useState } from 'react';
import { Button, Table } from '@douyinfe/semi-ui';
import { WorkItem, WorkObject } from '@lark-project/js-sdk';
import { IWorkItemTableProps } from './interface';

/**
 * WorkItemTable
 */
function WorkItemTable({
  workItems,
  onRemoveWorkItem,
}: IWorkItemTableProps): ReactElement {
  const [dataSource, setDataSource] = useState<{ workItem: WorkItem; workObject: WorkObject }[]>([]);
  useEffect(() => {
    // 自动拉取工作项详情
    (workItems || [])
      .reduce((pre, next) => {
        return pre.then(async (list) => {
          const workObject = await window.JSSDK.WorkObject.load({
            spaceId: next.spaceId,
            workObjectId: next.workObjectId,
          });
          const workItem = await window.JSSDK.WorkItem.load({
            spaceId: next.spaceId,
            workObjectId: next.workObjectId,
            workItemId: next.id,
          });
          return [...list, { workObject, workItem }];
        });
      }, Promise.resolve([] as { workItem: WorkItem; workObject: WorkObject }[]))
      .then(list => {
        setDataSource(list);
      });
  }, [workItems]);
  return (
    <Table
      dataSource={dataSource}
      columns={[
        {
          title: '实例名称',
          dataIndex: 'workItem.name',
          render: (text, data) => (
            <a
              target="_blank"
              style={{
                color: '#5083fb',
                cursor: 'pointer',
              }}
              // 点击实例名称弹出实例详情页
              onClick={() => {
                window.JSSDK.navigation.openWorkItemDetailPage({
                  spaceId: data.workItem.spaceId,
                  workObjectId: data.workItem.workObjectId,
                  workItemId: data.workItem.id,
                });
              }}>
              {text}
            </a>
          ),
        },
        {
          title: '工作项类型',
          dataIndex: 'workObject.name',
        },
        {
          title: '流程模式',
          dataIndex: 'workObject.flowMode',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 80,
          render: (text, data) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                type="primary"
                theme="solid"
                // 点击弹出实例详情页
                onClick={() => {
                  window.JSSDK.navigation.openWorkItemDetailPage({
                    spaceId: data.workItem.spaceId,
                    workObjectId: data.workItem.workObjectId,
                    workItemId: data.workItem.id,
                  });
                }}
              >
                详情
              </Button>
              <Button
                type="danger"
                theme="solid"
                // 点击从缓存删除
                onClick={() => {
                  onRemoveWorkItem?.(data.workItem.id);
                }}
              >
                从缓存删除
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}

export default WorkItemTable;
