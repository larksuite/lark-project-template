import { Form } from '@douyinfe/semi-ui';
import React, { useState } from 'react';
import { FieldType } from '@lark-project/js-sdk';
import type { BaseFieldProps } from '../fieldForm';

const { DatePicker } = Form;

export function FieldDatePicker({ onUpdate, fieldType, ...props }: BaseFieldProps) {
  const { field } = props;
  const [selectDatetime, setSelectDateTime] = useState<number>(0);
  const onChangeDateTime = val => {
    const selectMs = +new Date(val);
    setSelectDateTime(selectMs);
  };
  const onDateTimeBlur = async () => {
    // 提交选中的时间
    await onUpdate({
      field_key: field,
      field_value: selectDatetime,
    });
  };
  const onDatePangeChange = async date => {
    if (Array.isArray(date)) {
      const times = date.map(time => +new Date(time));
      const [startTime, endTime] = times;
      await onUpdate({
        field_key: field,
        field_value: {
          start_time: startTime || 0,
          end_time: endTime || 0,
        },
      });
    }
  };
  return fieldType === FieldType.date ? (
    <DatePicker onChange={onChangeDateTime} onBlur={onDateTimeBlur} {...props} type="dateTime" />
  ) : (
    <DatePicker onChange={onDatePangeChange} {...props} type="dateRange" />
  );
}
