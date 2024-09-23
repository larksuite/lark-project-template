import React, { useEffect, useState } from 'react';
import { Button, TextArea } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { useSdkContext, useLogin } from '../../hooks';
import dashBoardStore from '../../store/dashBoard';
import { copyClipboard, isMobile } from '../../utils';
import './app.less';

const includeKeys = ['id', 'name', 'project_key', 'simple_name', 'sub_state', 'work_item_type_key'];
function BasicInfoButton() {
  const [previewData, setPreviewData] = useState<string>('');
  const sdkContext = useSdkContext();
  const isLogin = useLogin();
  const { workItemInfo } = dashBoardStore;
  const queryWorkItemInfo = async () => {
    try {
      if (!sdkContext?.activeWorkItem?.id || !isLogin) return;
      const { spaceId, workObjectId, id } = sdkContext.activeWorkItem;
      await dashBoardStore.getWorkItemInfo({
        spaceId,
        workItemId: id,
        workObjectId,
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    (async () => {
      await queryWorkItemInfo();
    })();
  }, [sdkContext?.activeWorkItem?.id, isLogin]);
  useEffect(() => {
    const viewData = includeKeys.reduce((pre, cur) => {
      if (workItemInfo[cur]) {
        return {
          ...pre,
          [cur]: workItemInfo[cur],
        };
      }
      return pre;
    }, {});
    const jsonData = Object.keys(viewData).length ? JSON.stringify(viewData, null, 4) : '';
    setPreviewData(jsonData);
  }, [workItemInfo]);
  const copyData = async () => {
    try {
      const isSuccess = await copyClipboard(previewData);
      await window.JSSDK.containerModal.closeModal();
      if (isSuccess) {
        await window.JSSDK.toast.success('复制成功');
      } else {
        await window.JSSDK.toast.error('复制失败');
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={`wrapper ${isMobile ? 'wrapper-mobile' : ''}`}>
      <div className="content-textarea">
        <TextArea
          value={previewData}
          onChange={v => {
            setPreviewData(v);
          }}
          autosize
        />
      </div>
      <div className="content-operate">
        <Button onClick={copyData}>复制</Button>
      </div>
    </div>
  );
}

export default observer(BasicInfoButton);
