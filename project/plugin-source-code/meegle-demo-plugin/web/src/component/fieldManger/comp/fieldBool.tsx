import React, { useEffect } from 'react';
import { Form, useFormApi } from '@douyinfe/semi-ui';
import type { BaseFieldProps } from '../fieldForm';
// import { useWorkInfoItemFieldValue } from "./helper";
import dashBoardStore from '../../../store/dashBoard';

const { RadioGroup, Radio } = Form;

export function FieldBool({ onUpdate, ...props }: BaseFieldProps) {
  const { field } = props;
  const formApi = useFormApi();
  const { workItemInfo } = dashBoardStore;
  const currentFieldValue = dashBoardStore.getWorkInfoFieldValue(field);
  useEffect(() => {
    if (typeof currentFieldValue === 'undefined') return;
    formApi.setValue(field, currentFieldValue ? 1 : 0);
  }, [workItemInfo]);
  const onChangeHandler = async event => {
    const fieldValue = Boolean(event.target.value);
    await onUpdate({
      field_key: field,
      field_value: fieldValue,
    });
  };
  return (
    <RadioGroup {...props} onChange={onChangeHandler}>
      <Radio value={1}>是</Radio>
      <Radio value={0}>否</Radio>
    </RadioGroup>
  );
}
