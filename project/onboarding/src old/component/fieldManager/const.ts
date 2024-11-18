import { FieldType } from '@lark-project/js-sdk';
import { FieldText, FieldNumber, FieldDatePicker } from './comp';

export const fieldToComp = {
  [FieldType.text]: FieldText,
  [FieldType.richText]: FieldText,
  [FieldType.date]: FieldDatePicker,
  [FieldType.dateRange]: FieldDatePicker,
  [FieldType.link]: FieldText,
  [FieldType.number]: FieldNumber,
};
