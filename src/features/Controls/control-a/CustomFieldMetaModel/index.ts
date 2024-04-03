import { FieldMetaModel } from '@lark-project/BasePlugin';
import { SchemaValueType } from '../../../../constants/type';
import { CONTROL_KEY, CONTROL_NAME } from '../constants';
import FieldConfigDescriptor from './FieldConfigDescriptor';

export default class CustomFieldMetaModel extends FieldMetaModel {
  meta = {
    // 控件名称，表单项/列资源库显示这个
    label: CONTROL_NAME,
    // 与开发者后台的控件标识保持一致，作为控件的唯一标记
    type: CONTROL_KEY,
    // 控件值基础类型，如控件数据不存储在 Meegle 则不需要关心
    valueType: SchemaValueType.STRING,
    // 控件的描述，在表单项控件信息面板会被展示
    description: '',
  };
  defaultField = {
    // 与开发者后台的控件标识保持一致，作为控件的唯一标记
    key: CONTROL_KEY,
    // 表格/表单实际显示这个
    name: CONTROL_NAME,
    // 为 true 则不显示 Label，包含 tooltip
    noLabel: false,
    // Label 上更多信息的 tooltip
    tooltip: '',
  };
  fieldConfigDescriptor = new FieldConfigDescriptor();
}
