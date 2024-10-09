import { Form, Row } from '@douyinfe/semi-ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormApi } from '@douyinfe/semi-ui/lib/es/form';
import { observer } from 'mobx-react';
import { BriefField, Field, FieldType } from '@lark-project/js-sdk';
import { debounce } from 'lodash-es';
import dashBoardStore from '../../store/dashBoard';
import { fieldToComp } from './const';
import { FieldPreview } from './comp';
import { useSdkContext } from '../../hooks';
import { IUpdateField } from '../../types/openapi';
import './fieldForm.less';
import { isMobile } from '../../utils';

export interface BaseFieldProps {
  label: string;
  field: string;
  fieldType: string;
  fieldClassName: string;
  pure: boolean;
  onUpdate: (updateField: IUpdateField) => Promise<void>;
  placeholder?: string | undefined;
  style?: React.CSSProperties | undefined;
  [prop: string]: any;
}
interface IFieldFormProps {
  active: string;
}
type FieldMap = Map<string, Field>;
export const FieldForm: React.FC<IFieldFormProps> = observer(({ active }) => {
  const formApi = useRef<FormApi>();
  const sdkContext = useSdkContext();
  const [fieldsConfigMap, setFieldsConfigMap] = useState<Map<string, Field>>(new Map());
  const { fieldsTypeGrop } = dashBoardStore;
  const getFieldsConfig = async (fields: BriefField[]) => {
    try {
      if (!sdkContext?.activeWorkItem?.id) return;
      const { spaceId = '', workObjectId = '' } = sdkContext.activeWorkItem;
      const promises = fields.map(({ id }) =>
        window.JSSDK.Field.load({
          spaceId,
          workObjectId,
          fieldId: id,
        }),
      );
      const fetchfieldConfigsMap = await Promise.allSettled(promises).then(results =>
        results.reduce((pre, cur, index) => {
          if (cur.status === 'fulfilled' && cur.value) {
            pre.set(cur.value.id, cur.value);
          } else if (cur.status === 'rejected') {
            console.log(`field.load.${fields[index]?.id} Error:`, cur.reason);
          }
          return pre;
        }, new Map() as FieldMap),
      );
      if (fetchfieldConfigsMap.size) {
        setFieldsConfigMap(fetchfieldConfigsMap);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fieldItems = useMemo(() => fieldsTypeGrop[active] || [], [active]);
  const RenderComp: React.FC<BaseFieldProps> = useMemo(() => {
    const Comp = fieldToComp[active] || FieldPreview;
    return observer(Comp);
  }, [active]);
  useEffect(() => {
    getFieldsConfig(fieldItems);
  }, [fieldItems, sdkContext?.activeWorkItem?.id]);
  const updateFieldHandler = debounce(async (updateField: IUpdateField) => {
    try {
      if (!sdkContext?.activeWorkItem?.id) return;
      const { id, spaceId, workObjectId } = sdkContext.activeWorkItem;
      const updateFields = [updateField];
      const res = await dashBoardStore.updateWorkItem(
        {
          project_key: spaceId,
          work_item_id: id,
          work_item_type_key: workObjectId,
        },
        updateFields,
      );
      if (res.err_code !== 0) {
        await window.JSSDK.toast.error(`字段更新失败: ${res?.err_msg}`);
        return;
      }
      await window.JSSDK.toast.success('字段更新成功');
      await dashBoardStore.getWorkItemInfo({
        spaceId,
        workItemId: id,
        workObjectId,
      });
    } catch (error) {
      window.JSSDK.toast.error('服务端异常');
    }
  }, 500);
  const getFieldItemStyle = fieldType => {
    let width = '100%';
    const selectField: string[] = [
      FieldType.date,
      FieldType.dateRange,
      FieldType.select,
      FieldType.multiSelect,
      FieldType.treeSelect,
      FieldType.treeMultiSelect,
      FieldType.number,
    ];
    if (!isMobile && selectField.includes(fieldType)) {
      width = '30vw';
    }
    return {
      width,
    };
  };

  const renderFieldItems = useMemo(
    () =>
      fieldItems.map(item => {
        const isSystemCalculateField = fieldsConfigMap.get(item.id)?.isSystemCalculateField;
        const disabled = Boolean(isSystemCalculateField);
        let tooltipContent = '';
        if (isSystemCalculateField) {
          tooltipContent = '系统计算字段，不可编辑';
        }
        const renderExtraText = (
          <div
            style={{
              color: 'var(--semi-color-link)',
              fontSize: 14,
              userSelect: 'none',
            }}
          >
            {tooltipContent}
          </div>
        );
        return (
          <Row key={item.id}>
            <RenderComp
              field={item.id}
              fieldType={item.type}
              label={item.name}
              disabled={disabled}
              pure={false}
              key={item.id}
              fieldClassName="plugin-form-field"
              placeholder="待填"
              style={getFieldItemStyle(item.type)}
              onUpdate={async arg => updateFieldHandler(arg)}
              extraText={renderExtraText}
            />
          </Row>
        );
      }),
    [fieldItems, RenderComp, fieldsConfigMap],
  );
  return (
    <Form
      labelPosition={isMobile ? 'top' : 'left'}
      labelWidth={isMobile ? '1000%' : '180px'}
      labelCol={{ span: 2 }}
      getFormApi={api => {
        formApi.current = api;
      }}
    >
      {renderFieldItems}
    </Form>
  );
});
