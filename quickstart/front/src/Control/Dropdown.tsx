import React from 'react';
// @ts-ignore
import { PopupContentContext } from '@lark-project/ui-kit-plugin';
import { Select } from '@douyinfe/semi-ui';

const { Option } = Select;

function Dropdown() {
  const { context } = PopupContentContext.useContext();
  const { optionList, onChange, value } = context;

  if (Object.keys(context).length === 0) {
    return null;
  }

  return (
    <div className="semi-select-option-list">
      {optionList.map((item) => (
        <Option
          className="semi-select-option"
          selected={value === item.value}
          showTick={value === item.value}
          key={item.value}
          value={item.value}
          onSelect={() => {
            onChange && onChange(item.value);
          }}>
          {item.label}
        </Option>
      ))}
    </div>
  );
}

export default function PovDropdown(props) {
  return (
    <PopupContentContext.Provider>
      <Dropdown {...props} />
    </PopupContentContext.Provider>
  );
}
