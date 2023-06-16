import React from 'react';
import { FieldMetaModel } from '@lark-project/BasePlugin';
import { MFieldUsedScene, SchemaValueType } from '../../constants/type';
import RenderControlForm from './form';
import RenderControlTableJSX from './table';

const isNone = (v: any): boolean => [null, void 0, ''].includes(v);

class ControlModel<T> extends FieldMetaModel<string, T> {
  class = 'control';
  meta = {
    type: `control_demo`,
    label: '进度条控件',
    valueType: SchemaValueType.STRING,
    value: '-',
    placeholder: '待填',
    description: 'form 和 table 类型的控件',
    supportScene: MFieldUsedScene.FORM | MFieldUsedScene.TABLE,
  };
  defaultField = {
    key: `control_demo`,
    name: '进度条控件',
    value: '-',
    placeholder: '待填',
    internal: false,
    editable: true,
    scope: ['story', 'issue'],
  };

  normalizeValue(value: string) {
    return typeof value === 'string';
  }

  getLabel(field, item) {
    return '进度条控件';
  }

  validateValue(value: string) {
    return true;
  }

  getNormalizedValue(value: string) {
    return this.normalizeValue(value) ? value : '';
  }

  validateField = (value: string) => {
    if (isNone(value)) {
      return undefined;
    }
  };
}

export default {
  render: {
    table: {
      config: {
        maxWidthInTable: 300,
        minWidthInTable: 150,
      },
      component: {
        display: null,
        displayJSX: props => <RenderControlTableJSX {...props} />,
        edit: null,
      },
    },
    form: {
      component: {
        display: RenderControlForm,
        edit: null,
      },
    },
    filter: {
      component: null,
    },
  },
  fieldMeta: ControlModel,
};
