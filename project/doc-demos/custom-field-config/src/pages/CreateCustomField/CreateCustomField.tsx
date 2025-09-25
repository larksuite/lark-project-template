import { ReactElement, useState } from 'react';
import { nanoid } from 'nanoid';
import { Button, Form } from '@douyinfe/semi-ui';
import type { FormApi } from '@douyinfe/semi-ui/lib/es/form';
import { ICustomField } from '../../types';
import { FieldPreview } from '../../widgets';
import styles from './CreateCustomField.module.less';

function CreateCustomField(): ReactElement {
  const [form, setForm] = useState<FormApi>();
  const [formState, setFormState] = useState<ICustomField>({ field_key: `custom_field_${nanoid(6)}`, field_name: '', field_type: 'text' });
  return (
    <div className={styles.CreateCustomField}>
      <div className={styles.title}>新建自定义字段</div>
      <Form initValues={formState} getFormApi={setForm}>
        <Form.Input field="field_key" label="字段key" disabled rules={[{ required: true }]} />
        <Form.Input field="field_name" label="字段名称" rules={[{ required: true }]} />
        <Form.Select field="field_type" label="字段类型" style={{ width: '100%' }} onChange={v => setFormState({ ...formState, field_type: v as string })}>
          <Form.Select.Option value="text">文本</Form.Select.Option>
          <Form.Select.Option value="number">数字</Form.Select.Option>
          <Form.Select.Option value="date">日期</Form.Select.Option>
          <Form.Select.Option value="user">单选人员</Form.Select.Option>
        </Form.Select>
        <Form.Label>字段预览</Form.Label>
        <div>
          <FieldPreview field_type={formState.field_type} />
        </div>
      </Form>
      <div className={styles.footer}>
        <Button
          type="primary"
          theme="solid"
          onClick={async () => {
            if (!form) {
              return;
            }
            let values = {};
            try {
              values = await form.validate();
            } catch (error) {
              console.error(error);
              return;
            }
            let customFieldList = await window.JSSDK.storage.getItem('custom_field');
            let customFields: ICustomField[] = [];
            if (customFieldList) {
              customFields = JSON.parse(customFieldList);
            }
            customFields.unshift(values as ICustomField);
            await window.JSSDK.storage.setItem('custom_field', JSON.stringify(customFields));
            await window.JSSDK.containerModal.submit?.({});
            window.JSSDK.containerModal.close();
          }}
        >
            创建
        </Button>
        <Button onClick={() => window.JSSDK.containerModal.close()}>取消</Button>
      </div>
    </div>
  );
}

export default CreateCustomField;
