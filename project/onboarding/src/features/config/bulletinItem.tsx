import React, { useEffect } from 'react';
import { Form, Row, useFormApi } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { debounce } from 'lodash-es';
import { useSdkContext, useLogin } from '../../hooks';
import { bulletinStore } from '../../store/bulletin';
import { validateUrl } from '../../utils';

export const BulletinFormItem: React.FC = observer(() => {
  const sdkContext = useSdkContext();
  const formApi = useFormApi();
  const { bulletin } = bulletinStore;
  const isLogin = useLogin();
  const queryBulletin = async () => {
    try {
      const spaceId = sdkContext?.mainSpace?.id || '';
      if (!spaceId || !isLogin) return;
      await bulletinStore.queryBulletin(spaceId, 'config');
      formApi.setValue('bulletin', bulletin.defaultUrl);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    (async () => {
      await queryBulletin();
    })();
  }, [sdkContext?.mainSpace?.id, formApi, isLogin]);
  const onBlurHandler = debounce(async () => {
    try {
      const bulletinUrl: string = formApi.getValue('bulletin') || '';
      const trimUrl = bulletinUrl?.trim();
      await validateUrl(trimUrl);
      if (trimUrl === bulletin.defaultUrl) return;
      const spaceId = sdkContext?.mainSpace?.id || '';
      if (!spaceId) return;
      const res = await bulletinStore.updateBulletin({
        project_key: spaceId,
        url: trimUrl,
        mode: 'config',
      });
      const toastConfig = {
        text: res?.success ? '更新成功' : '更新失败',
        type: res?.success ? 'success' : 'warning',
      };
      const { type, text } = toastConfig;
      await window.JSSDK.toast?.[type]?.(text);
      if (res?.success) {
        await queryBulletin();
      }
    } catch (error) {
      console.log(error);
    }
  }, 500);
  return (
    <Row type="flex" align="middle">
      <Form.Input
        field="bulletin"
        label="公告板"
        placeholder="配置公告板默认链接"
        style={{
          width: '30vw',
        }}
        onBlur={onBlurHandler}
      />
    </Row>
  );
});
