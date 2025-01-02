import React from "react";
import { Form } from "@douyinfe/semi-ui";
import type { BaseFieldProps } from "../FieldForm";

const { InputNumber } = Form;
export function FieldNumber({ onUpdate, ...props }: BaseFieldProps) {
  const { field } = props;
  const onNumberChange = async (value: number) => {
    await onUpdate({
      field_key: field,
      field_value: value,
    });
  };
  return (
    <InputNumber
      {...props}
      onNumberChange={onNumberChange}
    />
  );
}
