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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchConfigList,
  fetchDelRule,
  fetchReposList,
} from '../../api/service';
import { IConfigList, IRepos } from '../../api/types';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigList/ConfigItem';
import CopyBtn from '../../components/CopyBtn/CopyBtn';
import EditModal from '../../components/EditModal/EditModal';
import { ConfigContext } from '../../context/configContext';
import CustomRule from '../../components/CustomRule/CustomRule';
import useSdkContext from '../../hooks/useSdkContext';

export const Config = () => {
  const { mainSpace } = useSdkContext() ?? {};
  const projectKey = mainSpace?.id ?? '';
  const [visible, setVisible] = useState(false); // 是否显示modal
  const [isEdit, setIsEdit] = useState(false); // 是否为修改
  const [repositories, setRepos] = useState<Array<IRepos>>([]); // 仓库列表
  const [nodes, setNodes] = useState([]); // 节点列表
  const [updateFlag, setUpdateFlag] = useState(0); // 强制更新
  const [eventList, setEventList] = useState([]); // gitlab事件列表
  const [editInfo, setEditInfo] = useState(null); // 修改信息
  const [workItemList, setWorkItemList] = useState([]); // 工作项 & 模版
  const [required, setRequired] = useState(true); // 配置规则时是否展示必填模式
  const [modalLoading, setModalLoading] = useState(false); // 控制modal框是否loading
  const [templateList, setTemplateList] = useState([]); // 存储已经配置过规则的模版
  const [modalBtnLoading, setModalBtnLoading] = useState(false); // modal确认按钮的loading状态
  //@ts-ignore
  const [internal, setInternal] = useState(false);

  // @ts-ignore
  const fetchData = useCallback(() => {
    if (projectKey) {
      return fetchConfigList(projectKey)
        .then((res) => ({ rules: res?.data ?? [] }))
        .catch((err) => console.log(err));
    }
  }, [projectKey]);

  useEffect(() => {
    if (projectKey) {
      fetchReposList(projectKey).then((res) => {
        setRepos(res.data?.repositories.map((item) => item) || []);
      });
    }
  }, [projectKey]);

  const renderHeader = useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 12,
        }}>
        <CustomRule />
        <div style={{ width: 12 }}></div>
        {!internal && <CopyBtn />}
      </div>
    ),
    [internal],
  );

  return (
    <ConfigContext.Provider
      value={{
        workItem: workItemList,
        setWorkItem: setWorkItemList,
        isEdit,
        setIsEdit,
        repositories,
        setRepos,
        nodes,
        setNodes,
        eventList,
        setEventList,
        editInfo,
        setEditInfo,
        visible,
        setVisible,
        updateFlag,
        setUpdateFlag,
        required,
        setRequired,
        modalLoading,
        setModalLoading,
        templateList,
        setTemplateList,
        modalBtnLoading,
        setModalBtnLoading,
      }}>
      <ConfigList<IConfigList>
        //@ts-ignore
        forceUpdataFlag={updateFlag}
        addBtnText="添加流转规则"
        headerContent={renderHeader}
        renderItem={(item) => (
          <ConfigItem
            {...item}
            onRemove={(id: string) => {
              fetchDelRule(id).then((res) => {
                if (res.code === 200) {
                  setUpdateFlag((flag) => flag + 1);
                }
              });
            }}
            onEdit={(item) => {
              setVisible(true);
              setIsEdit(true);
              setEditInfo(item);
            }}
          />
        )}
        title="GitLab 规则列表"
        onClickAdd={() => {
          setIsEdit(false);
          setVisible(true);
          setModalLoading(true);
          setEditInfo(null);
        }}
      />
      <EditModal
        visible={visible}
        centered
        style={{ minWidth: 1080 }}
        maskClosable={false}
        width={1080}
        height={window.innerHeight < 930 ? 0 : 790}
        confirmLoading={modalBtnLoading}
        okText={isEdit ? '修改' : '创建'}
        cancelText="取消"
        onCancel={() => {
          setVisible(false);
          setIsEdit(false);
        }}
      />
    </ConfigContext.Provider>
  );
};
