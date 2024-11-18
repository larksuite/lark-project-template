import { sdk } from '../jssdk';
import { IUpdateField } from '../types/openapi';

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

// 更新工作项
export const updateWorkItem = async (
  { project_key, work_item_id, work_item_type_key }: IPathParams,
  updateFields: IUpdateField[],
) => {
  sdk.toast.info('请调用「更新工作项」API以完成更新操作');
};
