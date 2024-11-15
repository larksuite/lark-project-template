import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { BriefField } from '@lark-project/js-sdk';
import {
  getWorkItemInfo,
  updateWorkItem,
  getFieldAll,
  IPathParams,
  downloadFile,
} from '../../api/dashBoard';
import { SimpleField, WorkItemInfo, WorkItemField, IUpdateField } from '../../types';

const { JSSDK } = window;
class DashBoardStore {
  @observable
  // sdk 工作项配置获取到的字段列表;
  workObjectFields: BriefField[] = [];

  @observable
  // openapi 获取的字段配置
  simpleFields: SimpleField[] = [];

  @observable
  // openapi 获取的 工作项信息;
  workItemInfo: WorkItemInfo = {
    fields: [],
  };

  constructor() {
    makeObservable(this);
  }

  // 通过 sdk 获取工作项配置的基本信息的字段列表
  @action
  async getWorkObjectFields(spaceId: string, workObjectId: string) {
    const workObject = await JSSDK.WorkObject.load({
      spaceId,
      workObjectId,
    });
    const { fieldList } = workObject;
    runInAction(() => {
      const excludeIds = ['work_item_id', 'work_item_type_key'];
      this.workObjectFields = fieldList.filter(item => !excludeIds.includes(item.id));
    });
  }

  // 通过 openapi 获取空间字段信息;
  @action
  async getFieldsAll({ spaceId, workObjectId }: { spaceId: string; workObjectId: string }) {
    const { data } = await getFieldAll({
      project_key: spaceId,
      work_item_type_key: workObjectId,
    });
    runInAction(() => {
      this.simpleFields = data;
    });
  }

  //  通过 openapi 获取工作项实例信息
  @action
  async getWorkItemInfo({
    spaceId,
    workItemId,
    workObjectId,
  }: {
    spaceId: string;
    workObjectId: string;
    workItemId: number;
  }) {
    const { data } = await getWorkItemInfo({
      project_key: spaceId,
      work_item_type_key: workObjectId,
      work_item_ids: [workItemId],
    });
    runInAction(() => {
      if (data?.length > 0) {
        const [workItemInfo] = data;
        this.workItemInfo = workItemInfo;
      }
    });
  }

  // 通过 openapi 更新工作项;
  @action
  async updateWorkItem(
    { project_key, work_item_id, work_item_type_key }: IPathParams,
    updateFields: IUpdateField[],
  ) {
    try {
      return await updateWorkItem(
        {
          project_key,
          work_item_id,
          work_item_type_key,
        },
        updateFields,
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 通过 openapi 更新工作项;
  @action
  async downloadFile(paylaod: IPathParams, data: { uuid: string }) {
    try {
      return await downloadFile(paylaod, data);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @action
  getWorkInfoFieldValue(field: string) {
    const { workItemInfoFieldsMap } = this;
    return workItemInfoFieldsMap.get(field)?.field_value;
  }

  @computed
  get sdkFieldsMap() {
    const { workObjectFields } = this;
    const map = new Map<string, BriefField>();
    (workObjectFields || []).forEach(item => {
      map.set(item.id, item);
    });
    return map;
  }

  @computed
  get simpleFieldsMap() {
    const { simpleFields } = this;
    const map = new Map<string, SimpleField>();
    simpleFields.forEach(item => {
      map.set(item.field_key, item);
    });
    return map;
  }

  @computed
  get workItemInfoFieldsMap() {
    const { workItemInfo } = this;
    const map = new Map<string, WorkItemField>();
    (workItemInfo?.fields || []).forEach(item => {
      map.set(item.field_key, item);
    });
    return map;
  }

  // 按照字段类型分组, 用语根据激活的 tab， 渲染字段列表
  @computed
  get fieldsTypeGrop() {
    const { workObjectFields } = this;
    const obj: Record<string, BriefField[]> = {};
    (workObjectFields || []).forEach(item => {
      const { type } = item;
      if (obj[type]) {
        obj[type].push(item);
      } else {
        obj[type] = [item];
      }
    });
    return obj;
  }
}
const dashBoardStore = new DashBoardStore();
export default dashBoardStore;
