import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Typography, TextArea, Empty } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { useLogin, useSdkContext } from '../../hooks';
import { validateUrl } from '../../utils';
import './index.less';
import { BizModal } from '../biz';
import { bulletinStore } from '../../store/bulletin';
import NoContent from '../../assets/noContent.svg';

export enum OperatorType {
  CONFIG = 'config',
}
export const BulletinConfog: React.FC = observer(() => {
  const [visible, setVisible] = useState(false);
  const [textAreaUrl, setTextAreaUrl] = useState('');
  const sdkContext = useSdkContext();
  const isLogin = useLogin();
  const { bulletin } = bulletinStore;
  const queryBulletin = async (mode?: string) => {
    try {
      const spaceId = sdkContext?.mainSpace?.id || '';
      if (!spaceId || !isLogin) return;
      await bulletinStore.queryBulletin(spaceId, mode);
      if (mode === OperatorType.CONFIG) {
        setTextAreaUrl(bulletin.defaultUrl);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    queryBulletin();
  }, [sdkContext?.mainSpace?.id, isLogin]);
  useEffect(() => {
    const url = visible ? bulletin.url : '';
    setTextAreaUrl(url);
  }, [visible, bulletin.url]);
  const onCancel = () => {
    setVisible(false);
  };
  const onReset = async () => {
    await queryBulletin(OperatorType.CONFIG);
  };
  const onConfirm = async () => {
    try {
      const trimUrl = textAreaUrl?.trim();
      await validateUrl(trimUrl);
      if (trimUrl === bulletin.url) return;
      const spaceId = sdkContext?.mainSpace?.id || '';
      if (!spaceId) return;
      const res = await bulletinStore.updateBulletin({
        project_key: spaceId,
        url: trimUrl,
      });
      const toastText = res?.success ? '更新成功' : '更新失败';
      const toastType = res?.success ? 'success' : 'warning';
      await window.JSSDK.toast?.[toastType]?.(toastText);
      if (res?.success) {
        await queryBulletin();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setVisible(false);
    }
  };

  return (
    <div className="bulletinConfig">
      <Row type="flex" justify="end">
        <Col>
          <Button onClick={() => setVisible(true)} className="config-button">
            配置公告板
          </Button>
        </Col>
      </Row>
      <BizModal
        mask={false}
        visible={visible}
        title="配置公告板"
        onCancel={() => setVisible(false)}
        footer={
          <>
            <Button onClick={onCancel}>取消</Button>
            <Button onClick={onReset}>重置</Button>
            <Button onClick={onConfirm}>确认</Button>
          </>
        }
      >
        <Typography.Text>链接</Typography.Text>
        <TextArea
          autosize
          style={{ marginTop: 4 }}
          rows={3}
          value={textAreaUrl}
          onChange={setTextAreaUrl}
          placeholder="请输入有效链接"
        />
      </BizModal>
      <div className="content">
        {bulletin.url ? (
          <iframe
            src={bulletin.url}
            width="100%"
            height="100%"
            style={{
              border: 'none',
            }}
          />
        ) : (
          <Empty
            className="empty"
            image={<NoContent />}
            title="暂无内容"
            description="请先配置公告板"
          />
        )}
      </div>
    </div>
  );
});
