import table from './table';
import form from './form';
import CustomFieldMetaModel from './CustomFieldMetaModel';
import { CONTROL_KEY } from './constants';

export default {
  key: CONTROL_KEY,
  renderer: {
    fieldMeta: CustomFieldMetaModel,
    render: {
      table,
      form,
    },
  },
};
