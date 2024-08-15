/**
 * Copyright (2024) Bytedance Ltd. and/or its affiliates
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export enum MFieldUsedScene {
  TABLE = 1,
  FORM = 2,
  FILTER = 4,
  GROUP = 8,
  NODE_FORM = 16,
  DELIVERABLE = 32,
}

export enum SchemaValueType {
  STRING = 1,
  STRING_LIST = 2,
  INT = 3,
  INTLIST = 4,
  DATE = 5,
  DATE_RANGE = 6,
  BOOL = 7,
  BOOL_LIST = 8,
  USER = 9,
  USER_LIST = 10,
  JSON = 11,
  JSON_LIST = 12,
  FLOAT = 13,
}

export interface IControlFormItemProps {
  field: {
    // 当前控件唯一标识，注意与 CustomFieldMeta 定义的 Key 不同，增加了插件 ID 前缀
    key: string;
    // 当前控件名称
    name: string;
  };
  // 当前表单状态，render 代表正常工作项详情页展示，configure 则是在工作项配置页面
  mode: 'render' | 'configure';
  // 表单项所在的表单，detail 为详情页基础信息，否则为节点表单（节点 uuid）
  tab: 'detail' | string;
  // 当前控件值，如控件值持久化到飞书项目工作项实例
  value: any;
  // 当前控件对应配置项的数据，对应 fieldConfigDescriptor
  params: Record<string, any>;
  // 修改表单项的编辑态，当 editing = true 则渲染 EditFormItem，反之则相反
  markEditing: (editing: boolean) => void;
  // 修改当前控件值，持久化到飞书项目工作项实例
  onChange: (nextValue: any) => Promise<void>;
}

export interface IControlTableCellProps {
  // 当前控件值，如控件值持久化到飞书项目工作项实例
  value: any;
  // 当前列信息
  column: {
    // 当前控件唯一标识，注意与 CustomFieldMeta 定义的 Key 不同，增加了插件 ID 前缀
    key: string;
    // 控件名称
    label: string;
    // 当前控件对应配置项的数据，对应 fieldConfigDescriptor
    params: Record<string, any> & { demoMode: boolean };
  };
  // 当前行工作项实例信息
  item: {
    // 工作项实例 id
    id: number;
    // 工作项实例名称
    name: string;
    // 工作项实例所属空间 id，同 spaceId
    project_key: string;
    // 工作项实例的工作项对象类型，同 workObjectId
    work_item_type_key: string;
  };
}
