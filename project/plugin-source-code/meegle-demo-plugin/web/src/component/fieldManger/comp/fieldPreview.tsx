import React, { useEffect, useState } from 'react';
import { Button, Form } from '@douyinfe/semi-ui';
import ReactJson from 'react-json-view';
import type { BaseFieldProps } from '../fieldForm';
import { BizModal } from '../../biz';
import dashBoardStore from '../../../store/dashBoard';

export function FieldPreview({ field, label }: BaseFieldProps) {
  const [visible, setVisible] = useState(false);
  const [reviewData, setReviewData] = useState<object>({});

  const { sdkFieldsMap, workItemInfoFieldsMap } = dashBoardStore;

  const title = sdkFieldsMap.get(field)?.name;
  const onClose = () => {
    setVisible(false);
  };
  useEffect(() => {
    try {
      const jsonData = JSON.parse(
        JSON.stringify(
          {
            field_key: field,
            field_value: workItemInfoFieldsMap.get(field)?.field_value || '暂无初始值',
          },
          null,
          2,
        ),
      );
      setReviewData(jsonData);
    } catch (error) {
      console.log(error);
    }
  }, [workItemInfoFieldsMap]);
  return (
    <>
      <Form.Slot label={label}>
        <Button onClick={() => setVisible(true)}>查看</Button>
      </Form.Slot>

      <BizModal visible={visible} onOk={onClose} onCancel={onClose} title={title || ''}>
        <ReactJson src={reviewData} collapsed={1} enableClipboard={false} />
      </BizModal>
    </>
  );
}
