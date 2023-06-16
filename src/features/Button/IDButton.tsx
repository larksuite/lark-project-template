import { hot } from 'react-hot-loader/root';
import React, { useState, useEffect } from 'react';
import { Typography, Toast } from '@douyinfe/semi-ui';
import { Cursor } from '@lark-project/js-sdk';
import { sdkInstance } from '../../utils';

export default hot(() => {
  const [detailPage, setDetailPage] = useState<Cursor['detailPage']>();

  useEffect(() => {
    (async () => {
      try {
        const sdk = await sdkInstance.config();
        sdk.cursor.watch(nextValue => {
          setDetailPage(nextValue.detailPage);
        });
        setDetailPage(sdk?.cursor?.detailPage);
      } catch (error) {
        console.error('SDK 调用失败', error);
      }
    })();
  }, []);

  const handleView = () => {
    Toast.success(
      `空间 ID：${detailPage?.activeWorkItem?.spaceId}，工作项实例 ID：${detailPage?.activeWorkItem?.id}`,
    );
  };
  return <Typography.Text onClick={handleView}>查看空间 ID & 实例 ID</Typography.Text>;
});
