import React, { useEffect, useState } from 'react';
import { Form, Button, useFormApi } from '@douyinfe/semi-ui';
import { IconDownload } from '@douyinfe/semi-icons/lib/es/icons';
import qs from 'query-string';
import { RenderFileItemProps } from '@douyinfe/semi-ui/lib/es/upload';
import type { BaseFieldProps } from '../fieldForm';
import { useSdkContext } from '../../../hooks';
import { BASE_URL } from '../../../constants';
import dashBoardStore from '../../../store/dashBoard';
import { getToken } from '../../../utils';
import { downloadOperation } from './utils';

const { Upload } = Form;
const UPLOAD_URL = `${BASE_URL}/work_item/file/upload`;

export function FieldUpload({ onUpdate, ...props }: BaseFieldProps) {
  const { field } = props;
  const formApi = useFormApi();
  const [action, setAction] = useState('action');
  const sdkContext = useSdkContext();
  const { workItemInfo } = dashBoardStore;
  const currentFieldValue = dashBoardStore.getWorkInfoFieldValue(field);
  const [authen, setAuthen] = useState('');
  useEffect(() => {
    if (!sdkContext?.activeWorkItem?.id) return;
    const { spaceId, workObjectId, id } = sdkContext.activeWorkItem;
    const params = {
      project_key: spaceId,
      work_item_type_key: workObjectId,
      work_item_id: id,
    };
    setAction(`${UPLOAD_URL}?${qs.stringify(params)}`);
  }, [sdkContext?.activeWorkItem?.id]);
  useEffect(() => {
    if (typeof currentFieldValue === 'undefined') return;
    if (Array.isArray(currentFieldValue)) {
      const data = currentFieldValue.map(item => ({
        ...item,
        preview: true,
      }));
      formApi.setValue(field, data);
    }
  }, [workItemInfo]);
  useEffect(() => {
    getToken().then(res => {
      setAuthen(res.authorization);
    });
  }, []);

  const downloadHandler = async (fileItem: RenderFileItemProps) => {
    try {
      if (!sdkContext?.activeWorkItem?.id) return;
      const { spaceId, workObjectId, id } = sdkContext.activeWorkItem;
      const params = {
        project_key: spaceId,
        work_item_type_key: workObjectId,
        work_item_id: id,
      };
      const blobData = await dashBoardStore.downloadFile(params, {
        uuid: fileItem.uid || '',
      });
      if (!blobData) return;
      downloadOperation(blobData, fileItem.name);
    } catch (error) {
      console.log(error);
    }
  };
  const renderFileOperation = (fileItem: RenderFileItemProps) => {
    let disabled = false;
    if (Array.isArray(currentFieldValue)) {
      disabled = currentFieldValue.every(item => item.uid !== fileItem.uid);
    }
    return (
      <Button
        icon={<IconDownload />}
        type="tertiary"
        theme="borderless"
        size="small"
        disabled={disabled}
        onClick={() => downloadHandler(fileItem)}
      />
    );
  };
  const onSuccessHandler = async response => {
    try {
      if (!sdkContext?.activeWorkItem?.id) return;
      if (response?.err_code === 0) {
        const { spaceId, workObjectId, id } = sdkContext.activeWorkItem;
        await window.JSSDK.toast.success('上传成功');
        await dashBoardStore.getWorkItemInfo({
          spaceId,
          workItemId: id,
          workObjectId,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onErrorHandler = async error => {
    console.log(error);
    await window.JSSDK.toast.warning('上传失败');
  };
  return (
    <Upload
      action={action}
      {...props}
      data={{
        field_key: field,
      }}
      renderFileOperation={renderFileOperation}
      showClear={false}
      fileName="file"
      limit={5}
      headers={{
        Authorization: authen,
      }}
      onSuccess={onSuccessHandler}
      onError={onErrorHandler}
    >
      <Button theme="light">点击上传</Button>
    </Upload>
  );
}
