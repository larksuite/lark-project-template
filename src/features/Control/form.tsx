import React from 'react';
import { Progress } from '@douyinfe/semi-ui';
import './form.less';

const RenderControlForm = () => {
  return (
    <div className="from_progress">
      <Progress percent={80} showInfo={true} />
    </div>
  );
};

export default RenderControlForm;
