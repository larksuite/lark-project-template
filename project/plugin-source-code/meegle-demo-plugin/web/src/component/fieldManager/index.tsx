import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Button, TabPane, Tabs } from '@douyinfe/semi-ui';
import qs from 'query-string';
import dashBoardStore from '../../store/dashBoard';
import { useSdkContext, useLogin } from '../../hooks';
import './index.less';
import { copyClipboard, isMobile } from '../../utils';
import { fieldToComp } from './const';
import { FieldForm } from './fieldForm';
import pluginConfig from '../../../plugin.config.json';
import { DASH_BOARD_KEY } from '../../constants';

const fieldToCompKeys = Object.keys(fieldToComp);
const formatStr = (str: string) => {
  const words = str.split('_').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`);
  return words.join(' ');
};
export const FieldManager = observer(() => {
  const [tabActiveKey, setTabActiveKey] = useState<string>('');
  const { fieldsTypeGrop } = dashBoardStore;
  const sdkContext = useSdkContext();
  const isLogin = useLogin();
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

  useEffect(() => {
    (async () => {
      try {
        if (!sdkContext?.activeWorkItem?.id || !isLogin) return;
        const { spaceId, workObjectId } = sdkContext.activeWorkItem;
        await dashBoardStore.getFieldsAll({
          spaceId,
          workObjectId,
        });
      } catch (error) {
        console.log('getFieldsAll', error);
      }
    })();
  }, [sdkContext?.activeWorkItem?.id, isLogin]);
  useEffect(() => {
    (async () => {
      try {
        if (!sdkContext?.activeWorkItem?.id || !isLogin) return;
        const { spaceId, workObjectId, id } = sdkContext.activeWorkItem;
        await dashBoardStore.getWorkItemInfo({
          spaceId,
          workItemId: id,
          workObjectId,
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, [sdkContext?.activeWorkItem?.id, tabActiveKey, isLogin]);

  const tabList = useMemo(() => {
    const fieldKeys = Object.keys(fieldsTypeGrop);

    const supports = fieldToCompKeys.filter(key => fieldKeys.includes(key));
    const notSupports = fieldKeys.filter(key => !fieldToCompKeys.includes(key));
    return supports.concat(notSupports).map(key => ({
      itemKey: key,
      tab: formatStr(key),
    }));
  }, [fieldsTypeGrop]);
  useEffect(() => {
    (async () => {
      try {
        if (isMobile) {
          const key = tabList[0]?.itemKey || '';
          setTabActiveKey(key);
          return;
        }
        const hrefStr = await window.JSSDK.navigation.getHref();
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
  const onShareHandler = async (activeTab: string) => {
    try {
      const hrefStr = await window.JSSDK.navigation.getHref();
      const url = new URL(hrefStr);
      const openUrl = `${url.origin}${url.pathname}?activeTab=${activeTab}#${pluginConfig.pluginId}_${DASH_BOARD_KEY}`;
      const iscueess = await copyClipboard(openUrl);
      if (!iscueess) return;
      await window.JSSDK.toast.success('链接已复制到剪贴板');
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="fieldManager-layout">
      <Tabs
        collapsible
        type="button"
        className={`fieldManager-tabs${isMobile ? '-mobile' : ''}`}
        activeKey={tabActiveKey}
        onChange={(key: string) => setTabActiveKey(key)}
        tabBarExtraContent={
          <Button disabled={isMobile} onClick={() => onShareHandler(tabActiveKey)}>
            {`${isMobile ? 'No Support ' : 'Share'}`}
          </Button>
        }
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
