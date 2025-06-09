import { ReactElement, useEffect, useState } from 'react';
import { ISelectOption, Select } from '@lark-project/ui-kit-plugin';
import { BriefWorkObject } from '@lark-project/js-sdk';
import { IWorkObjectSelectProps } from './interface';
import styles from './WorkObjectSelect.module.less';

/**
 * WorkObjectSelect
 */
function WorkObjectSelect({
  className,
  value,
  onChange,
}: IWorkObjectSelectProps): ReactElement {
  const [optionList, setOptionList] = useState<ISelectOption<BriefWorkObject & { spaceId: string }>[]>([]);
  useEffect(() => {
    (async () => {
      const { spaceId} = await window.JSSDK.page.getContext();
      const { enabledWorkObjectList, id } = await window.JSSDK.Space.load(spaceId);
      setOptionList(
        enabledWorkObjectList.map(item => ({
          label: item.name,
          value: item.id,
          data: { ...item, spaceId: id },
        }))
      );
    })();
  }, []);

  return (
    <Select
      className={styles.WorkObjectSelect}
      placeholder="请选择工作项类型"
      optionList={optionList}
      value={value}
      onChange={onChange}
    />
  );
}

export default WorkObjectSelect;
