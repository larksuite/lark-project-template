import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { BriefField } from '@lark-project/js-sdk';
import { updateWorkItem, IPathParams } from '../../api/dashBoard';
import { IUpdateField } from '../../types';
import { sdk } from '../../jssdk';

// openapi 文档：https://meego-hc.larkoffice.com/b/helpcenter/1p8d7djs/53kr9loy
class DashBoardStore {
  @observable
  // sdk 工作项配置获取到的字段列表;
  workObjectFields: BriefField[] = [];

  constructor() {
    makeObservable(this);
  }

  // 通过 sdk 获取工作项配置的基本信息的字段列表
  @action
  async getWorkObjectFields(spaceId: string, workObjectId: string) {
    const workObject = await sdk.WorkObject.load({
      spaceId,
      workObjectId,
    });
    const { fieldList } = workObject;
    runInAction(() => {
      const excludeIds = ['work_item_id', 'work_item_type_key'];
      this.workObjectFields = fieldList.filter(item => !excludeIds.includes(item.id));
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
  @computed
  get sdkFieldsMap() {
    const { workObjectFields } = this;
    const map = new Map<string, BriefField>();
    (workObjectFields || []).forEach(item => {
      map.set(item.id, item);
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
