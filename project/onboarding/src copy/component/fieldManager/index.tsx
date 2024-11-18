import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import dashBoardStore from '../../store/dashBoard';
import { useSdkContext, useLogin } from '../../hooks';
import './index.less';
import { FieldForm } from './fieldForm';
export const FieldManager = observer(() => {
  const sdkContext = useSdkContext();
  const isLogin = useLogin();
  useEffect(() => {
    (async () => {
      try {
        if (!sdkContext?.activeWorkItem?.id) return;
        const { spaceId, workObjectId } = sdkContext.activeWorkItem;
        await dashBoardStore.getWorkObjectFields(spaceId, workObjectId);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [sdkContext?.activeWorkItem?.id]);

  useEffect(() => {
    (async () => {
      try {
        if (!sdkContext?.activeWorkItem?.id || !isLogin) return;
        const { spaceId, workObjectId } = sdkContext.activeWorkItem;
        await dashBoardStore.getFieldsAll({
          spaceId,
          workObjectId,
        });
      } catch (error) {
        console.log('getFieldsAll', error);
      }
    })();
  }, [sdkContext?.activeWorkItem?.id, isLogin]);
  useEffect(() => {
    (async () => {
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
    })();
  }, [sdkContext?.activeWorkItem?.id, isLogin]);

  return (
    <div className="fieldManager-layout">
      <FieldForm />
    </div>
  );
});
