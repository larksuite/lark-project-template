import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Typography } from '@douyinfe/semi-ui';

export default hot(() => (
  <div
    style={{
      width: '100%',
      height: '100%',
    }}
  >
    <Typography.Text link={{ href: 'https://project.feishu.cn/', target: '_blank' }}>
      跳转链接
    </Typography.Text>
  </div>
));
