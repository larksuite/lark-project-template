import { SimpleField, IUpdateField, WorkItemInfo } from '../types/openapi';
import { request } from '../utils';

export interface ResWrapper<T = {}> {
  error: any;
  err_code: number;
  erro_msg: string;
  data: T;
}

export interface IPathParams {
  project_key: string;
  work_item_type_key: string;
  work_item_id: number;
}
export interface WorkItemInfoReq extends Omit<IPathParams, 'work_item_id'> {
  work_item_ids: IPathParams['work_item_id'][];
}

// 获取工作项详情
export const getWorkItemInfo = async ({
  project_key,
  work_item_type_key,
  work_item_ids,
}: WorkItemInfoReq) =>
  request
    .post<ResWrapper<WorkItemInfo[]>>(
      '/work_item/query',
      {
        work_item_ids,
      },
      {
        params: {
          project_key,
          work_item_type_key,
        },
      },
    )
    .then(res => res.data);
// 更新工作项
export const updateWorkItem = async (
  { project_key, work_item_id, work_item_type_key }: IPathParams,
  updateFields: IUpdateField[],
) =>
  request
    .put(
      '/work_item/update',
      {
        update_fields: updateFields,
      },
      {
        params: {
          project_key,
          work_item_id,
          work_item_type_key,
        },
      },
    )
    .then(res => res.data);
// 获取空间字段
export const getFieldAll = async ({
  project_key,
  work_item_type_key,
}: Omit<IPathParams, 'work_item_id'>) =>
  request
    .post<ResWrapper<SimpleField[]>>(
      '/field/all',
      {
        work_item_type_key,
      },
      {
        params: {
          project_key,
        },
      },
    )
    .then(res => res.data);
// 下载附件
export const downloadFile = async (
  { project_key, work_item_type_key, work_item_id }: IPathParams,
  data,
) =>
  request
    .post<Blob>('/work_item/file/download', data, {
      params: {
        project_key,
        work_item_type_key,
        work_item_id,
      },
      responseType: 'blob',
    })
    .then(res => res.data);
