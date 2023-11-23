import React, { useState } from 'react';
import { Slider } from '@douyinfe/semi-ui';
import { IControlFormItemProps } from '../../../../../constants/type';

const EditFormItem = (props: IControlFormItemProps) => {
  const [value, setValue] = useState(props.value);

  return (
    <Slider
      value={value}
      onChange={setValue}
      min={0}
      max={100}
      step={1}
      onAfterChange={async nextValue => {
        await props.onChange(nextValue);
        props.markEditing(false);
      }}
    ></Slider>
  );
};

export default EditFormItem;
