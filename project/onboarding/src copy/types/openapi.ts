export interface WorkItemField {
  field_key: string;
  field_value: any;
  field_type_key: string;
  field_alias: string;
}
export interface WorkItemInfo {
  fields: WorkItemField[];
  [prop: string]: any;
}
export interface IUpdateField {
  field_key: string;
  field_value: any;
}

export interface Option {
  label: string;
  value: string;
  children?: Option[];
}
// 新结构体
export interface SimpleField {
  field_key: string;
  field_alias: string;
  field_type_key: string;
  field_name: string;
  is_custom_field: boolean;
  options: Option[];
  compound_fields: SimpleField[];
}
