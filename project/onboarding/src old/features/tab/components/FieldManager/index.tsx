import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { TabPane, Tabs } from '@douyinfe/semi-ui';
import qs from 'query-string';
import './index.less';
import { useI18n } from '../../../../common/hooks/useI18n';
import { sdk } from '../../../../utils/jssdk';
import dashBoardStore from '../../store';
import { useSdkContext } from '../../../../common/hooks';
import { fieldToComp } from './const';
import { FieldForm } from './FieldForm';

const fieldToCompKeys = Object.keys(fieldToComp);

export const FieldManager = observer(() => {
  const [tabActiveKey, setTabActiveKey] = useState<string>('');
  const { fieldsTypeGrop } = dashBoardStore;
  const sdkContext = useSdkContext();
  const i18n = useI18n();
  useEffect(() => {
    (async () => {
      try {
        if (!sdkContext?.activeWorkItem?.id) return;
        const { spaceId, workObjectId } = sdkContext.activeWorkItem;
        await dashBoardStore.getWorkObjectFields(spaceId, workObjectId);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [sdkContext?.activeWorkItem?.id]);

  const tabList = useMemo(() => {
    const fieldKeys = Object.keys(fieldsTypeGrop);
    const supports = fieldToCompKeys.filter(key => fieldKeys.includes(key));
    return supports.map(key => ({
      itemKey: key,
      tab: i18n(key),
    }));
  }, [fieldsTypeGrop]);
  useEffect(() => {
    (async () => {
      try {
        const hrefStr = await sdk.navigation.getHref();
        const url = new URL(hrefStr);
        const parseUrl = qs.parse(url.search);
        const activeTab = parseUrl.activeTab as string;
        const key = activeTab || tabList[0]?.itemKey || '';
        setTabActiveKey(key);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [tabList]);
  return (
    <div className="fieldManager-layout">
      <Tabs
        collapsible
        type="button"
        className="fieldManager-tabs"
        activeKey={tabActiveKey}
        onChange={(key: string) => setTabActiveKey(key)}
      >
        {tabList.map(item => (
          <TabPane tab={item.tab} key={item.itemKey} itemKey={item.itemKey}>
            {tabActiveKey && <FieldForm active={tabActiveKey} />}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
});
