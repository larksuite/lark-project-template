import React, { useEffect, useMemo, useRef } from 'react';
import { Form, useFieldState, useFormApi } from '@douyinfe/semi-ui';
import type { CommonFieldProps } from '@douyinfe/semi-ui/lib/es/form';
import { FieldType } from '@lark-project/js-sdk';
import type { BaseFieldProps } from '../fieldForm';
import './fieldCommon.less';
import { isUrl } from '../../../utils';

export function FieldText({ onUpdate, fieldType, ...props }: BaseFieldProps) {
  const { field } = props;
  const formApi = useFormApi();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { touched } = useFieldState(field);
  const isTouched = !!touched;
  const isLink = fieldType === FieldType.link;
  useEffect(() => {
    if (isTouched && inputRef.current) {
      inputRef.current?.focus?.();
    }
  }, [isTouched, inputRef.current]);
  const setTouched = bool => {
    formApi.setTouched(field, bool);
  };
  const onBlurHandler = async e => {
    let { value } = e.target;
    const valueType = typeof value;
    if (valueType === 'undefined' || (valueType === 'string' && !value.trim())) {
      value = '';
    }
    const trimVal = `${value}`.trim();
    if (isLink && trimVal.length && !isUrl(trimVal)) return;
    setTouched(false);
    await onUpdate({
      field_key: field,
      field_value: value || '',
    });
  };
  const LinkProps = useMemo(() => {
    if (isLink) {
      return {
        trigger: 'blur' as CommonFieldProps['trigger'],
        rules: [
          {
            validator: (rule, value) => {
              const valueType = typeof value;
              if (valueType === 'undefined') return true;

              return isUrl(value);
            },
            message: '请输入有效链接',
          },
        ],
      };
    }
    return {};
  }, [isLink]);
  return (
    <Form.TextArea
      rows={1}
      autosize
      className={`field-${isTouched ? 'edit' : 'display'}`}
      onClick={() => setTouched(true)}
      ref={inputRef}
      onBlur={onBlurHandler}
      {...props}
      {...LinkProps}
    />
  );
}
