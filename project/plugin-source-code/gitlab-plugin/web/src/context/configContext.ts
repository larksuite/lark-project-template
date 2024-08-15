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

import React from 'react';
import type {
  GitlabEventList,
  IConfigList,
  IRepos,
  IWorkItem,
} from '../api/types';

interface INodes {
  label: string;
  value: string;
}

interface IContext {
  workItem: Array<IWorkItem>;
  setWorkItem: React.Dispatch<React.SetStateAction<Array<IWorkItem>>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  repositories: Array<IRepos>;
  setRepos: React.Dispatch<React.SetStateAction<Array<IRepos>>>;
  eventList: Array<GitlabEventList>;
  setEventList: React.Dispatch<React.SetStateAction<Array<GitlabEventList>>>;
  nodes: Array<INodes>;
  setNodes: React.Dispatch<React.SetStateAction<Array<INodes>>>;
  editInfo: IConfigList | null;
  setEditInfo: React.Dispatch<React.SetStateAction<IConfigList | null>>;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  updateFlag: number;
  setUpdateFlag: React.Dispatch<React.SetStateAction<number>>;
  required: boolean;
  setRequired: React.Dispatch<React.SetStateAction<boolean>>;
  modalLoading: boolean;
  setModalLoading: React.Dispatch<React.SetStateAction<boolean>>;
  templateList: Array<string>;
  setTemplateList: React.Dispatch<React.SetStateAction<Array<string>>>;
  modalBtnLoading: boolean;
  setModalBtnLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const defValue: IContext = {
  workItem: [],
  setWorkItem: (e: Array<IWorkItem>) => e,
  isEdit: false,
  setIsEdit: (e: boolean) => e,
  repositories: [],
  setRepos: (e: Array<IRepos>) => e,
  eventList: [],
  setEventList: (e: Array<GitlabEventList>) => e,
  nodes: [],
  setNodes: (e: Array<INodes>) => e,
  editInfo: null,
  setEditInfo: (e: IConfigList | null) => e,
  visible: false,
  setVisible: (e: boolean) => e,
  updateFlag: 0,
  setUpdateFlag: (e: number) => e,
  required: true,
  setRequired: (e: boolean) => e,
  modalLoading: false,
  setModalLoading: (e: boolean) => e,
  templateList: [],
  setTemplateList: (e: Array<string>) => e,
  modalBtnLoading: false,
  setModalBtnLoading: (e: boolean) => e,
};

export const ConfigContext = React.createContext(defValue);
