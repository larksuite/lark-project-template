import { ReactElement, useEffect, useState } from 'react';
import { Button, Table } from '@douyinfe/semi-ui';
import { ICustomField } from '../../../types';
import { FieldPreview } from '../../../widgets';
import { IFieldTableProps } from './interface';

function FieldTable({
  refer,
}: IFieldTableProps): ReactElement {
  const [dataSource, setDataSource] = useState<ICustomField[]>([]);
  useEffect(() => {
    window.JSSDK.storage.getItem('custom_field').then(list => {
      setDataSource(JSON.parse(list || '[]'));
    });
  }, []);
  useEffect(() => {
    if (!refer) {
      return;
    }
    refer.refresh = () => {
      window.JSSDK.storage.getItem('custom_field').then(list => {
        setDataSource(JSON.parse(list || '[]'));
      });
    };
  }, [refer]);
  return (
    <Table
      dataSource={dataSource}
      columns={[
        {
          title: '字段key',
          dataIndex: 'field_key',
        },
        {
          title: '字段名称',
          dataIndex: 'field_name',
        },
        {
          title: '字段类型',
          dataIndex: 'field_type',
        },
        {
          title: '字段渲染效果预览',
          dataIndex: 'preview',
          render: (_, data) => (
            <div>
              <FieldPreview field_type={data.field_type} />
            </div>
          ),
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 80,
          render: (text, data) => (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                type="danger"
                theme="solid"
                // 点击从缓存删除
                onClick={() => {
                  window.JSSDK.modal.confirm({
                    title: '删除自定义字段',
                    content: `确定删除自定义字段 ${data.field_name} 吗？`,
                  }, async ({ confirmed }) => {
                    if (!confirmed) {
                      return;
                    }
                    const customFieldList = await window.JSSDK.storage.getItem('custom_field');
                    if (!customFieldList) {
                      return;
                    }
                    const customFields = JSON.parse(customFieldList);
                    const newCustomFields = customFields.filter(item => item.field_key !== data.field_key);
                    await window.JSSDK.storage.setItem('custom_field', JSON.stringify(newCustomFields));
                    refer?.refresh?.();
                  });
                }}
              >
                删除
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}

export default FieldTable;
