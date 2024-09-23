import { IUpdateBody, IBulletinItem } from './type';
import { dbService } from './db';

class BulletinService {
  private findBulletinIndex = -1;

  private sourceDbBulletin: IBulletinItem[] = [];

  private amendBulletin(payload: IUpdateBody) {
    const isConfig = payload.mode === 'config';
    const updateKey = isConfig ? 'default_url' : 'url';
    const currentBulletin: IBulletinItem =
      this.sourceDbBulletin[this.findBulletinIndex] || ({} as IBulletinItem);
    const updateBulletinPayload = {
      ...currentBulletin,
      [updateKey]: payload.url || '',
    };
    this.sourceDbBulletin.splice(this.findBulletinIndex, 1, updateBulletinPayload);
    console.log('修改操作');
  }

  private createBulletin(payload: IUpdateBody) {
    const isConfig = payload.mode === 'config';
    const updateKey = isConfig ? 'default_url' : 'url';
    const newBulletion: IBulletinItem = {
      project_key: payload.project_key,
      [updateKey]: payload.url || '',
    };
    this.sourceDbBulletin.push(newBulletion);
    console.log('新增操作');
  }

  private async updateBulletinToDb() {
    try {
      await dbService.setBulletin(this.sourceDbBulletin);
      return true;
    } catch (error) {
      console.log('updateDbBulletin:Error', error);
      return false;
    }
  }

  async queryBulletin(project_key: string) {
    try {
      const sourceData = await dbService.getBulletion();
      this.sourceDbBulletin = sourceData || [];
      const findBulletinIndex = this.sourceDbBulletin.findIndex(
        (item: IBulletinItem) => item.project_key === project_key,
      );
      if (findBulletinIndex !== -1) {
        this.findBulletinIndex = findBulletinIndex;
      }
      return this.sourceDbBulletin[findBulletinIndex] || ({} as IBulletinItem);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateBulletin(payload: IUpdateBody) {
    await this.queryBulletin(payload.project_key);
    const isAmend = this.findBulletinIndex !== -1 && this.sourceDbBulletin[this.findBulletinIndex];
    isAmend ? this.amendBulletin(payload) : this.createBulletin(payload);
    return this.updateBulletinToDb();
  }
}
export const bulletinService = new BulletinService();
