import { useRef, useState } from 'react';
import { FormApi } from '@douyinfe/semi-ui/lib/es/form';

interface Rule {
  name: string;
  description: string;
}
const useModel = () => {
  const [ruleList, setRuleList] = useState<Rule[]>([]);
  const [visible, setVisible] = useState<boolean>();
  const api = useRef<FormApi>();

  const handleNewRule = () => {
    setVisible(true);
  };
  const handleOk = () => {
    api.current
      ?.validate()
      .then((values: Rule) => {
        setRuleList(rules => [...rules, { ...values }]);
        setVisible(false);
      })
      .catch(errors => {
        console.log(errors);
      });
  };
  const handleCancel = () => {
    setVisible(false);
  };

  const handleDelete = (indexToRemove: number) => {
    const newRuleList = ruleList.filter((_, index) => index !== indexToRemove);
    setRuleList(newRuleList);
  };

  return { api, ruleList, visible, handleNewRule, handleOk, handleCancel, handleDelete };
};

export default useModel;
