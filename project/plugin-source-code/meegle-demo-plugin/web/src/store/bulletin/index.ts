import { action, makeObservable, observable, runInAction } from 'mobx';
import { IBulletinReq, queryBulletin, updateBulletin } from '../../api';

interface Bulletin {
  url: string;
  defaultUrl: string;
}
class BulletinStore {
  @observable
  bulletin: Bulletin = {
    url: '',
    defaultUrl: '',
  };

  constructor() {
    makeObservable(this);
  }

  @action
  async queryBulletin(project_key: IBulletinReq['project_key'], mode?: string) {
    const key = mode ? 'defaultUrl' : 'url';
    const result = mode ? await queryBulletin(project_key, mode) : await queryBulletin(project_key);
    runInAction(() => {
      this.bulletin[key] = result.data || '';
    });
    return result;
  }

  @action
  async updateBulletin(data: IBulletinReq) {
    return updateBulletin(data);
  }
}

export const bulletinStore = new BulletinStore();
