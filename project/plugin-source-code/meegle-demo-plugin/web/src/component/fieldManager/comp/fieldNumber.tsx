import React, { useEffect } from 'react';
import { Form, useFormApi } from '@douyinfe/semi-ui';
import type { BaseFieldProps } from '../fieldForm';
import dashBoardStore from '../../../store/dashBoard';

const { InputNumber } = Form;
export function FieldNumber({ onUpdate, ...props }: BaseFieldProps) {
  const { field } = props;
  const formApi = useFormApi();
  const { workItemInfo } = dashBoardStore;

  const currentFieldValue = dashBoardStore.getWorkInfoFieldValue(field);
  useEffect(() => {
    if (typeof currentFieldValue === 'undefined') return;
    formApi.setValue(field, currentFieldValue);
  }, [workItemInfo]);
  const onNumberChange = async (value: number) => {
    await onUpdate({
      field_key: field,
      field_value: value,
    });
  };
  return (
    <InputNumber
      {...props}
      formatter={value => `${value}`.replace(/\D/g, '')}
      onNumberChange={onNumberChange}
    />
  );
}
