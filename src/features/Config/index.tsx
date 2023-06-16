import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Layout, Typography, Empty, Button, Modal, Form } from '@douyinfe/semi-ui';
import { IconDelete, IconPlusCircle } from '@douyinfe/semi-icons';
import noContent from '../../assets/noContent.svg';
import useModel from './model';
import './index.less';
const { Header, Content } = Layout;

export default hot(() => {
  const { ruleList, visible, api, handleNewRule, handleOk, handleCancel, handleDelete } =
    useModel();

  return (
    <Layout className="config-container">
      <Header className="header">
        <Typography.Title heading={2}>规则列表</Typography.Title>
        <Button theme="solid" type="primary" icon={<IconPlusCircle />} onClick={handleNewRule}>
          添加规则
        </Button>
      </Header>
      <Content className="content">
        {ruleList.length ? (
          ruleList.map((rule, index) => (
            <section className="rule-item">
              <div className="rule-item-info">
                <Typography.Title heading={4}>{rule.name}</Typography.Title>
                <div>{rule.description}</div>
              </div>
              <IconDelete className="delete" size="large" onClick={() => handleDelete(index)} />
            </section>
          ))
        ) : (
          <Empty
            className="empty"
            image={noContent}
            title={'暂无规则'}
            description="当前插件暂未配置规则，请添加"
          />
        )}
      </Content>
      {visible ? (
        <Modal title="新建规则" centered visible={visible} onOk={handleOk} onCancel={handleCancel}>
          <Form getFormApi={formApi => (api.current = formApi)}>
            <Form.Input
              field="name"
              label="名称"
              // @ts-expect-error
              autocomplete="off"
              placeholder="请输入规则名称"
              rules={[{ required: true, message: 'required error' }]}
            />
            <Form.TextArea
              field="description"
              label="描述"
              placeholder="请输入规则描述"
              maxCount={100}
              rules={[{ required: true, message: 'required error' }]}
            />
          </Form>
        </Modal>
      ) : null}
    </Layout>
  );
});
