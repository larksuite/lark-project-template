import React, { useEffect, useMemo, useState } from 'react';
import { Form, useFormApi } from '@douyinfe/semi-ui';
import { FieldType } from '@lark-project/js-sdk';
import type { BaseFieldProps } from '../fieldForm';
import dashBoardStore from '../../../store/dashBoard';

const { Select } = Form;
export function FieldSelect({ onUpdate, ...props }: BaseFieldProps) {
  const formApi = useFormApi();
  const { field, fieldType } = props;
  const { simpleFieldsMap } = dashBoardStore;
  const options = useMemo(() => simpleFieldsMap.get(field)?.options || [], [simpleFieldsMap]);
  const currentFieldValue = dashBoardStore.getWorkInfoFieldValue(field);
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  useEffect(() => {
    switch (fieldType) {
      case FieldType.multiSelect:
        {
          if (!currentFieldValue || !Array.isArray(currentFieldValue)) return;
          const values = currentFieldValue.map(item => item.value);
          formApi.setValue(field, values);
        }

        break;
      case FieldType.select:
        if (!currentFieldValue) return;
        formApi.setValue(field, currentFieldValue.value);
        break;
      default:
        break;
    }
  }, [FieldType]);
  const isMultiple = fieldType === FieldType.multiSelect;
  const onChangeHandler = async val => {
    switch (fieldType) {
      case FieldType.select:
        await onUpdate({
          field_key: field,
          field_value: {
            value: val,
          },
        });
        break;

      case FieldType.multiSelect:
        setMultiSelectValues(val);
        break;
      default:
        break;
    }
  };
  const onMultibluerHandler = async () => {
    if (fieldType === FieldType.multiSelect) {
      await onUpdate({
        field_key: field,
        field_value: multiSelectValues.map(item => ({
          value: item,
        })),
      });
    }
  };
  return (
    <Select
      {...props}
      onChange={onChangeHandler}
      onBlur={onMultibluerHandler}
      multiple={isMultiple}
    >
      {options.map(item => (
        <Select.Option label={item.label} value={item.value} key={item.value} />
      ))}
    </Select>
  );
}
