import { ReactElement } from 'react';
import { Input, InputNumber } from '@douyinfe/semi-ui';
import { DatePicker, UserSelect } from '@lark-project/ui-kit-plugin';
import { switchKey } from '../../utils';
import { IFieldPreviewProps } from './interface';

/**
 * FieldPreview
 */
function FieldPreview({
  field_type,
}: IFieldPreviewProps): ReactElement {
  return (
    <>
      {switchKey(field_type || '', {
        text: () => <Input style={{ width: '100%' }} placeholder="文本字段" />,
        number: () => <InputNumber style={{ width: '100%' }} placeholder="数字字段" />,
        date: () => <DatePicker style={{ width: '100%' }} placeholder="日期字段" />,
        user: () => <UserSelect style={{ width: '100%' }} placeholder="单选人员" multiple={false} />,
        default: () => <>暂不支持的字段类型</>,
      })}
    </>
  );
}

export default FieldPreview;
