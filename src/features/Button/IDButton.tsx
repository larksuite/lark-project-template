import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Typography, Toast } from '@douyinfe/semi-ui';
import { Context } from '@lark-project/js-sdk';
import useSdkContext from '../../hooks/useSdkContext';

export default hot(() => {
  const content: Context | undefined = useSdkContext();

  const handleView = () => {
    Toast.success(
      `空间 ID：${content?.activeWorkItem?.spaceId}，工作项实例 ID：${content?.activeWorkItem?.id}`,
    );
  };
  return <Typography.Text onClick={handleView}>查看空间 ID & 实例 ID</Typography.Text>;
});
