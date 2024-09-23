import React from 'react';
import { Form } from '@douyinfe/semi-ui';
import { BulletinFormItem } from './bulletinItem';

export default function Config() {
  return (
    <div
      style={{
        padding: '0 20px',
      }}
    >
      <Form labelPosition="left" labelWidth="180px">
        <BulletinFormItem />
      </Form>
    </div>
  );
}
