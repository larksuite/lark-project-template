/**
 * Copyright (2024) Bytedance Ltd. and/or its affiliates
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable max-lines-per-function */
import React, { useContext, useEffect, useRef, type FC, useState } from 'react';
import {
  Modal,
  Form,
  Row,
  Col,
  Card,
  Tooltip,
  Toast,
  Spin,
  Typography,
} from '@douyinfe/semi-ui';
import type { ModalReactProps } from '@douyinfe/semi-ui/lib/es/modal';
import WorkTypeSelect from './WorkTypeSelect';
import { IconInfoCircle, IconLink } from '@douyinfe/semi-icons';
import RuleList from './RuleList';
import { isEmpty } from 'lodash';
import { ConfigContext } from '../../context/configContext';
import { fetchAddRules } from '../../api/service';
import { FormApi } from '@douyinfe/semi-ui/lib/es/form';
import useSdkContext from '../../hooks/useSdkContext';

const { Title: SemiTitle, Text } = Typography;

const createParams = (workItem, values, eventList, nodes, spaceId) => {
  const [workItemId, tempId] = values.name;
  const { rules } = values;
  const selectWorkItem = workItem.find((item) => item.value === workItemId);
  const selectTemp = selectWorkItem.children.find(
    (item) => item.value === tempId,
  );
  const prefix = 'GitLab 关联';
  const title = `${prefix} ${selectWorkItem.label} -> ${selectTemp.label}`;
  const template = {
    id: selectTemp.template_id,
    name: selectTemp.label,
    type: selectWorkItem.flowMode,
    message: '',
  };
  const work_item_type = {
    key: selectWorkItem.value,
    name: selectWorkItem.label,
  };
  const forward = rules.map((rule) => {
    const repositories = rule.repo.map((repo) => ({
      path_with_namespace: repo,
    }));
    const source = eventList[0];
    const nodesValue = rule.nodes;
    const control_level = !rule.must ? 2 : 1;
    const targets = rule.nodes
      .map((item) => nodes.find((node) => item === node.value))
      ?.map((target) => ({ key: target.value, name: target.label }));
    const messages = {
      source: '',
      target: '',
    };
    return {
      id: window.btoa(new Date().getTime().toString()),
      repositories,
      source,
      valuse: nodesValue,
      control_level,
      targets,
      messages,
    };
  });
  return {
    project_key: spaceId,
    title,
    template,
    work_item_type,
    forward,
    enable: true,
  };
};

const renderHeader = (required) => (
  <Row
    gutter={8}
    type={'flex'}
    align={'middle'}>
    <Col span={14}>
      <SemiTitle heading={6}>GitLab</SemiTitle>
    </Col>
    <Col span={10}>
      <Row
        gutter={8}
        type={'flex'}
        align={'middle'}>
        <Col span={14}>
          <SemiTitle heading={6}>{'飞书项目'}</SemiTitle>
        </Col>
        <Col span={8}>
          {required ? (
            <SemiTitle heading={6}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>{'必填模式'}</span>
                <Tooltip
                  content={
                    '打开必填模式后，将为该节点增设必填字段，仅在 GitLab 信号流入后节点才可流转'
                  }>
                  <IconInfoCircle />
                </Tooltip>
              </div>
            </SemiTitle>
          ) : null}
        </Col>
      </Row>
    </Col>
  </Row>
);

const Title = (props) => (
  <div
    style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingRight: 12,
    }}>
    <div>{'GitLab 关联'}</div>
  </div>
);

const EditModal: FC<ModalReactProps> = (props) => {
  const formRef = useRef<Form>(null);
  const { visible, ...rest } = props;
  const context = useSdkContext();
  const mainSpace = context?.mainSpace;

  const {
    workItem,
    eventList,
    nodes,
    isEdit,
    editInfo,
    setUpdateFlag,
    setVisible,
    required,
    modalLoading,
    setModalBtnLoading,
  } = useContext(ConfigContext);
  const createRule = async () => {
    const formApi = formRef.current?.formApi as unknown as FormApi;
    formApi.validate();
    const errorInfo = formApi.getFormState().errors;
    if (isEmpty(errorInfo)) {
      setModalBtnLoading(true);
      const values = formApi.getValues();
      const rules: any = createParams(
        workItem,
        values,
        eventList,
        nodes,
        mainSpace?.id,
      );
      if (isEdit && editInfo) {
        rules.id = editInfo.id;
      }
      fetchAddRules(rules)
        .then((res) => {
          if (res.code === 200) {
            Toast.success(isEdit ? '修改成功' : '添加成功');
            setVisible(false);
            setUpdateFlag((prev) => prev + 1);
          } else {
            Toast.error(res.msg);
          }
        })
        .catch((e) => Toast.error(e))
        //用.then()替换.finally()
        .then(() => setModalBtnLoading(false));
    }
  };

  const formApi = formRef.current?.formApi;
  useEffect(() => {
    if (isEdit && editInfo && formApi) {
      const { work_item_type, template, forward } = editInfo;
      formApi.setValue('name', [work_item_type.key, template.id]);
      formApi.setValue(
        'rules',
        forward.map((item) => ({
          repo: item.repositories.map((repo) => repo.path_with_namespace),
          event: item.source.key,
          nodes: item.targets.map((repo) => repo.key),
          must: item.control_level === 1,
        })),
      );
    }
  }, [isEdit, editInfo, formApi]);

  useEffect(() => {
    if (visible && !editInfo && formApi) {
      formApi.setValue('rules', [{}]);
    }
  }, [visible, editInfo, formApi]);

  return (
    <Modal
      {...rest}
      onOk={createRule}
      visible={visible}
      title={<Title />}>
      <Spin
        tip=""
        spinning={modalLoading}>
        <Form
          ref={formRef}
          render={({ values, formApi }) => {
            return (
              <>
                <Row>
                  <Col span={10}>
                    <WorkTypeSelect
                      formApi={formApi}
                      style={{ width: '100%' }}
                      spaceId={mainSpace?.id || ''}
                      field={'name'}
                      label={'工作项类型'}
                      rules={[
                        {
                          required: true,
                          message: '请选择工作项类型',
                        },
                      ]}
                    />
                  </Col>
                </Row>
                <Row style={{ marginBottom: 12 }}>
                  <Text>{`设置 GitLab 操作事件与飞书项目工作项节点的映射关系：`}</Text>
                </Row>
                <Card title={renderHeader(required)}>
                  <RuleList values={values} />
                </Card>
              </>
            );
          }}></Form>
      </Spin>
    </Modal>
  );
};

export default EditModal;
