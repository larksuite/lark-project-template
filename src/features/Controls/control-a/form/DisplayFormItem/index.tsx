import React from 'react';
import { Progress } from '@douyinfe/semi-ui';
import { IControlFormItemProps } from '../../../../../constants/type';
// import { useSafeFormikFieldState } from 'useSafeFormikFieldState';

import './index.less';

const DisplayFormItem = (props: IControlFormItemProps) => {
  // const [field] = useSafeFormikFieldState('field_id');

  if (props.mode === 'configure') {
    return '配置页不支持展示';
  }

  return (
    <div className="from_progress" onClick={() => props.markEditing(true)}>
      <Progress percent={props.value} showInfo={true} />
    </div>
  );
};

export default DisplayFormItem;
