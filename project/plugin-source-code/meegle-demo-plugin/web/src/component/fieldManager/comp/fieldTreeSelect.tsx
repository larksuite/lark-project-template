import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, useFormApi } from '@douyinfe/semi-ui';
import { FieldType } from '@lark-project/js-sdk';
import type { BaseFieldProps } from '../fieldForm';
import dashBoardStore from '../../../store/dashBoard';
import { formatTreeData, nonLeafNode, findValueWithParent, findLeafValue } from './utils';

const { TreeSelect } = Form;
export function FieldTreeSelect({ fieldType, onUpdate, ...props }: BaseFieldProps) {
  const { field } = props;
  const formApi = useFormApi();

  const { simpleFieldsMap } = dashBoardStore;
  const options = useMemo(() => simpleFieldsMap.get(field)?.options || [], [simpleFieldsMap]);
  const treeData = useMemo(() => formatTreeData(options), [options, fieldType]);

  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const submitData = useRef<string[]>([]);
  const { workItemInfo } = dashBoardStore;

  const onSelectHandler = async selectKey => {
    if (nonLeafNode(options, selectKey)) return;
    console.log(options, selectKey);
    const data = findValueWithParent(options, selectKey);
    await onUpdate({
      field_key: field,
      field_value: data,
    });
  };
  const onMultiSelectHandler = selectKey => {
    setMultiSelectValues(vals =>
      vals.includes(selectKey) ? [...vals.filter(val => val !== selectKey)] : [...vals, selectKey],
    );
  };

  const currentFieldValue = dashBoardStore.getWorkInfoFieldValue(field);
  useEffect(() => {
    if (!currentFieldValue) return;

    switch (fieldType) {
      case FieldType.treeSelect:
        {
          const data = findLeafValue(currentFieldValue);
          formApi.setValue(field, data);
        }
        break;

      case FieldType.treeMultiSelect:
        if (Array.isArray(currentFieldValue) && currentFieldValue.length > 0) {
          formApi.setValue(
            field,
            currentFieldValue.map(item => findLeafValue(item)),
          );
          setMultiSelectValues(currentFieldValue.map(item => findLeafValue(item)));
        }
        break;
      default:
        break;
    }
  }, [workItemInfo]);
  useEffect(() => {
    if (multiSelectValues.length) {
      submitData.current = multiSelectValues.map(item => findValueWithParent(options, item));
    } else {
      submitData.current = [];
    }
  }, [options, multiSelectValues]);
  const onMultSelectBlurHanlder = async () => {
    await onUpdate({
      field_key: field,
      field_value: submitData.current,
    });
  };

  const renderComp = useMemo(() => {
    switch (fieldType) {
      case FieldType.treeSelect:
        return (
          <TreeSelect
            expandAction="click"
            onSelect={onSelectHandler}
            treeData={treeData}
            {...props}
          />
        );
      case FieldType.treeMultiSelect:
        return (
          <TreeSelect
            multiple
            maxTagCount={5}
            leafOnly
            expandAction="click"
            onSelect={onMultiSelectHandler}
            treeData={treeData}
            {...props}
            onBlur={onMultSelectBlurHanlder}
          />
        );

      default:
        return null;
    }
  }, [fieldType]);
  return renderComp;
}
