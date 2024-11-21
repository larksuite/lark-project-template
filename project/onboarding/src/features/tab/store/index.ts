import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { BriefField } from '@lark-project/js-sdk';
import { sdk } from '../../../utils/jssdk';

// For details of OpenAPI, please refer to：https://meego-hc.larkoffice.com/b/helpcenter/1p8d7djs/53kr9loy
class DashBoardStore {
  @observable
  // The field list obtained by the SDK work item configuration
  workObjectFields: BriefField[] = [];

  constructor() {
    makeObservable(this);
  }

  // Obtain the field list of the basic information of work item configuration through the SDK.
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

  @computed
  get sdkFieldsMap() {
    const { workObjectFields } = this;
    const map = new Map<string, BriefField>();
    (workObjectFields || []).forEach(item => {
      map.set(item.id, item);
    });
    return map;
  }

  // Group by field type. It is used to render the field list according to the activated tab.
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
