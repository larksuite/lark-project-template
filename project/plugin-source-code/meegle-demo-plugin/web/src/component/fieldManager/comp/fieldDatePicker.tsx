import { Form, useFormApi } from '@douyinfe/semi-ui';
import React, { useEffect, useState } from 'react';
import { FieldType } from '@lark-project/js-sdk';
import type { BaseFieldProps } from '../fieldForm';
import dashBoardStore from '../../../store/dashBoard';

const { DatePicker } = Form;

export function FieldDatePicker({ onUpdate, fieldType, ...props }: BaseFieldProps) {
  const { field } = props;
  const formApi = useFormApi();
  const { workItemInfo } = dashBoardStore;
  const currentFieldValue = dashBoardStore.getWorkInfoFieldValue(field);
  const [selectDatetime, setSelectDateTime] = useState<number>(0);
  // 初始化数据
  useEffect(() => {
    if (typeof currentFieldValue === 'undefined') return;
    switch (fieldType) {
      case FieldType.date:
        formApi.setValue(field, currentFieldValue);
        break;
      case FieldType.dateRange:
        {
          if (!currentFieldValue) return;
          const { start_time: startTime, end_time: endTime } = currentFieldValue;
          if (startTime && endTime) {
            formApi.setValue(field, [startTime, endTime]);
          }
        }
        break;
      default:
        break;
    }
  }, [workItemInfo]);
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
