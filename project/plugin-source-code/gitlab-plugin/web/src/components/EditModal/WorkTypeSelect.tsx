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

import React, {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncFormCascader, {
  type AsyncFormCascaderProps,
} from '../AsyncFormCascader/AsyncFormCascader';
import { getFlowMode, getSpace } from '../../utils';
import { ConfigContext } from '../../context/configContext';
import {
  fetchApprovalList,
  fetchFlowNodes,
  fetchTemplateList,
} from '../../api/service';
import type { FormApi } from '@douyinfe/semi-ui/lib/es/form';
import { IWorkItem } from '../../api/types';

type Props = Omit<AsyncFormCascaderProps, 'fetchData'> & {
  spaceId: string;
  formApi: FormApi;
};

const WorkTypeSelect: FC<Props> = (props) => {
  const { spaceId, formApi, ...rest } = props;
  const {
    workItem,
    setWorkItem,
    setNodes,
    setEventList,
    isEdit,
    editInfo,
    setRequired,
    setModalLoading,
    templateList,
  } = useContext(ConfigContext);
  const [value, setValue] = useState<string | null>(null);
  // 获取 工作项列表 & 工作流模式 & 模版
  const fetchOptions = useCallback(async () => {
    setModalLoading(true);
    if (workItem.length > 0) {
      setModalLoading(false);
      return workItem;
    }
    const { enabledWorkObjectList } = await getSpace(spaceId);
    const options: Array<IWorkItem> = await Promise.all(
      enabledWorkObjectList.map((wo) =>
        getFlowMode({ spaceId, workObjectId: wo.id }).then((mode) => ({
          label: wo.name,
          value: wo.id,
          flowMode: mode,
        })),
      ),
    );
    const tempList = await Promise.all(
      enabledWorkObjectList.map((wo) =>
        fetchTemplateList(spaceId, wo.id)
          .then((res) => res.data)
          .catch(() => []),
      ),
    );
    enabledWorkObjectList.map(async (workObj, workObjIndex) => {
      const children: any = [];
      tempList[workObjIndex].map(
        (temp) =>
          // 此处过滤掉已经禁用的模版 后期JSSDK支持的话就用JSSDK
          temp.is_disabled === 2 &&
          children.push({
            ...temp,
            disabled:
              !!templateList.find((t) => t === temp.template_id) || false,
            label: temp.template_name,
            value: temp.template_id,
          }),
      );
      options[workObjIndex].children = children;
    });
    setWorkItem(options);
    setModalLoading(false);
    return options;
  }, [spaceId]);
  // 获取event事件以及模版节点
  const handlerChange = async ([wId, id]) => {
    setValue(wId);
    // 切换工作项时如果节点或者gitlab事件有值的话需要清空
    //TODO:targets和source是在这里获取的
    const values = formApi.getValues();
    if (values.rules && values.rules.length > 0 && !isEdit) {
      values.rules.map((item, index) => {
        formApi.setValue(`rules[${index}]event`, '');
        formApi.setValue(`rules[${index}]nodes`, []);
      });
    }
    // 模版id不存在
    if (!id) {
      setEventList([]);
      setNodes([]);
      return;
    }
    setModalLoading(true);
    const nodes = await fetchFlowNodes(spaceId, id).then((res) => {
      const data =
        res.data.state_flow_confs && res.data.state_flow_confs.length
          ? res.data.state_flow_confs
          : res.data.workflow_confs;
      return data.map((conf) => ({
        label: conf.name,
        value: conf.state_key,
      }));
    });
    const events = await fetchApprovalList().then((res) => {
      return res.data?.data || [];
    });
    setEventList(events as any);
    nodes ? setNodes(nodes) : setNodes([]);
    setModalLoading(false);
  };
  useEffect(() => {
    if (value && workItem) {
      const item = workItem.find((item) => item.value === value);
      if (item && item.flowMode === 'stateflow') {
        setRequired(false);
      } else {
        setRequired(true);
      }
    }
  }, [value, workItem]);
  // 修改时获取已选工作项的 event事件以及模版节点
  useEffect(() => {
    if (isEdit && editInfo) {
      handlerChange([editInfo.work_item_type.key, editInfo.template.id]);
    }
  }, [isEdit, editInfo]);

  return (
    <AsyncFormCascader
      {...rest}
      disabled={isEdit}
      onChange={handlerChange}
      fetchData={fetchOptions}
      style={{ width: '100%' }}
    />
  );
};

export default WorkTypeSelect;
