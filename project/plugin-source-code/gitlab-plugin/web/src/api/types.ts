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

export interface ResponseWrap<D> {
  code: number;
  msg: string;
  data?: D;
  error?: {
    id: number;
    localizedMessage: {
      locale: string;
      message: string;
    };
  };
}

export enum DisabledState {
  Disabled = 1,
  Enabled,
}

export interface GitlabEvent<T> {
  events: Array<T>;
}

export interface GitlabEventList {
  key: string;
  name: string;
}

export interface IWorkItem {
  label: string;
  value: string;
  flowMode?: string;
  children?: Array<{
    is_disabled: number;
    template_id: string;
    template_key: string;
    template_name: string;
    unique_key: string;
    version: number;
    label: string;
    value: string;
    flowMode?: string;
    isLeaf?: boolean;
  }>;
}

export interface WorkflowConfig {
  deletable: boolean;
  deletable_operation_role: string[];
  different_schedule: boolean;
  done_allocate_owner: boolean;
  done_operation_role: string[];
  done_schedule: boolean;
  is_limit_node: boolean;
  name: string;
  need_schedule: boolean;
  owner_roles: string[];
  owner_usage_mode: number;
  owners: string[];
  pass_mode: number;
  state_key: string;
  tags: string[];
  visibility_usage_mode: number;
}

export interface Connection {
  source_state_key: string;
  target_state_key: string;
}

export interface INodes {
  template_id: number;
  template_name: string;
  version: number;
  is_disabled: DisabledState;
  workflow_confs: WorkflowConfig[];
  connections: Connection[];
  state_flow_confs: Array<{
    name: string;
    state_key: string;
    state_type: 1;
    authorized_roles: Array<string>;
  }>;
}

export interface TemplateInfo {
  is_disabled: DisabledState;
  template_id: string;
  template_key: string;
  template_name: string;
  unique_key: string;
  version: number;
}

export interface IConfigList {
  enable: boolean;
  forward: Array<{
    control_level: number;
    id: string;
    messages: {
      source: string;
      target: string;
    };
    repositories: Array<{
      name: string;
      path_with_namespace: string;
      url?: string;
    }>;
    source: {
      key: string;
      name: string;
    };
    targets: Array<{
      key: string;
      name: string;
    }>;
  }>;
  id: string;
  project_key: string;
  template: {
    id: string;
    name: string;
    type: string;
    message?: string;
  };
  title: string;
  work_item_type: {
    key: string;
    name: string;
    message?: string;
  };
}

export interface IRepositories {
  path_with_namespace: string;
}

export interface IRepos {
  name: string;
  path_with_namespace: string;
  url?: string;
}

export interface IRelevances {
  branch: IBranch[];
  commit: ICommit[];
  merge_request: IMergeRequest[];
}

export interface IBranch {
  branch: string;
  deletable: boolean;
  id: string;
  mr_status: string;
  mr_url: string;
  name: string;
  node_id: string;
  repo: string;
  repository: {
    name: string;
    path_with_namespace: string;
    url: string;
  };
  update_time: number;
  work_item_id: string;
}

export interface ICommit {
  author: {
    email: string;
    id: number;
    name: string;
    username: string;
  };
  branch: string;
  commit_id: string;
  deletable: boolean;
  id: string;
  message: string;
  repository: {
    name: string;
    path_with_namespace: string;
    url: string;
  };
  update_time: number;
  url: string;
  work_item_id: string;
}

export interface IMergeRequest {
  deletable: boolean;
  id: string;
  merge_request_id: string;
  repository: {
    name: string;
    path_with_namespace: string;
    url: string;
  };
  source_branch: string;
  state: string;
  target_branch: string;
  title: string;
  update_time: number;
  url: string;
  workItem_id: string;
}

export interface ICommonSetting {
  settings: {
    name: string;
    project_key: string;
    setting_type: number;
    settings: string;
  }[];
}
