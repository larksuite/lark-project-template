import { FieldType } from '@lark-project/js-sdk';
import {
  FieldText,
  FieldBool,
  FieldSelect,
  FieldNumber,
  FieldUpload,
  FieldTreeSelect,
  FieldDatePicker,
} from './comp';

export const fieldToComp = {
  [FieldType.text]: FieldText, // 文本和链接
  [FieldType.bool]: FieldBool,
  [FieldType.select]: FieldSelect,
  [FieldType.multiSelect]: FieldSelect,
  [FieldType.link]: FieldText,
  [FieldType.number]: FieldNumber,
  [FieldType.date]: FieldDatePicker,
  [FieldType.dateRange]: FieldDatePicker,
  [FieldType.treeSelect]: FieldTreeSelect,
  [FieldType.treeMultiSelect]: FieldTreeSelect,
  [FieldType.attachment]: FieldUpload,
};
