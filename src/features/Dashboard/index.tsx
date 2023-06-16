import { hot } from 'react-hot-loader/root';
import React from 'react';
import { List, Typography, Empty } from '@douyinfe/semi-ui';
import { IconLink } from '@douyinfe/semi-icons';
import useModel from './model';
import noContent from '../../assets/noContent.svg';
import './index.less';

export default hot(() => {
  const { documents } = useModel();

  return (
    <div className="dashboard-container">
      <Typography.Title heading={3} className="title">
        链接汇总
      </Typography.Title>
      {documents?.length ? (
        <List
          bordered
          dataSource={documents}
          renderItem={item => (
            <List.Item>
              <span className="list-item-title">{item.key}</span>
              <span className="list-item-link">
                {item.value ? (
                  <Typography.Text
                    link={{ href: item.value, target: '_blank' }}
                    icon={<IconLink />}
                  >
                    {item.value}
                  </Typography.Text>
                ) : (
                  '暂无'
                )}
              </span>
            </List.Item>
          )}
        />
      ) : (
        <Empty image={noContent} title={'暂无数据'} description="当前工作项下暂无链接数据" />
      )}
    </div>
  );
});
