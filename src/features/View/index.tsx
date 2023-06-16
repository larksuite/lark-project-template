import { hot } from 'react-hot-loader/root';
import React from 'react';
import { List, Descriptions } from '@douyinfe/semi-ui';
import './index.less';

export default hot(() => {
  const mockViewData = [
    {
      title: '需求_1',
      priority: 5,
      description: '这是需求的一段描述',
      count: 124,
    },
    {
      title: '需求_2',
      priority: 4,
      description: '这是需求的一段描述',
      count: 108,
    },
    {
      title: '需求_3',
      priority: 3,
      description: '这是需求的一段描述',
      count: 244,
    },
    {
      title: '需求_4',
      priority: 1,
      description: '这是需求的一段描述',
      count: 189,
    },
    {
      title: '需求_5',
      priority: 3,
      description: '这是需求的一段描述',
      count: 128,
    },
    {
      title: '需求_6',
      priority: 0,
      description: '这是需求的一段描述',
      count: 156,
    },
  ];

  return (
    <div className="view-container">
      <List
        grid={{
          gutter: 12,
          xs: 0,
          sm: 0,
          md: 12,
          lg: 8,
          xl: 8,
          xxl: 6,
        }}
        dataSource={mockViewData}
        renderItem={item => (
          <List.Item className="list-item">
            <div>
              <div className="item-title">{item.title}</div>
              <Descriptions
                align="center"
                size="small"
                row
                data={[
                  { key: '优先级', value: item.priority },
                  { key: '缺陷数量', value: item.count },
                  { key: '描述', value: item.description },
                ]}
              />
            </div>
          </List.Item>
        )}
      />
    </div>
  );
});
