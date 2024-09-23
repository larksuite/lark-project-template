import fs from 'fs-extra';
import path from 'path';
import { tmpdir } from 'os';
import { IBulletinItem } from './type';
import { IUserPluginToken, IPluginToken } from '../types';

const ROOT_DB_DIR = path.join(tmpdir(), 'db');
console.log('ROOT_DB_DIR', ROOT_DB_DIR);
const dbJsonFile = (fileName: string) => path.join(ROOT_DB_DIR, `${fileName}.json`);
export enum DbPathMap { // db map
  BULLETIN_BOARDS = 'bulletins',
  USER_PLUGIN_TOKEN = 'user_plugin_token',
  PLUGN_TOKEN = 'plugin_token',
}
class DbService {
  constructor() {
    if (!fs.pathExistsSync(ROOT_DB_DIR)) {
      fs.mkdirSync(ROOT_DB_DIR);
    }
  }

  private async read(filePath: DbPathMap) {
    try {
      const data = await fs.readJSON(dbJsonFile(filePath));
      return data;
    } catch (error) {
      console.log(`readJson failed: ${error}`);
      return null;
    }
  }

  private async write(filePath: DbPathMap, json: any) {
    try {
      return fs.outputJSONSync(dbJsonFile(filePath), json, {
        spaces: 2,
      });
    } catch (error) {
      console.log(`writeJson failed: ${error}`);
      return null;
    }
  }

  async getBulletion(): Promise<IBulletinItem[] | null> {
    return this.read(DbPathMap.BULLETIN_BOARDS);
  }

  async setBulletin(data: IBulletinItem[]) {
    await this.write(DbPathMap.BULLETIN_BOARDS, data);
  }

  async getUserPluginToken(): Promise<IUserPluginToken | null> {
    return this.read(DbPathMap.USER_PLUGIN_TOKEN);
  }

  async setUerPluginToken(data: Record<string, IUserPluginToken>) {
    const sourceData = await this.getUserPluginToken();
    await this.write(DbPathMap.USER_PLUGIN_TOKEN, {
      ...sourceData,
      ...data,
    });
    return true;
  }

  async getPluginToken(): Promise<IPluginToken | null> {
    return this.read(DbPathMap.PLUGN_TOKEN);
  }

  async setPluginToken(data: IPluginToken) {
    return this.write(DbPathMap.PLUGN_TOKEN, data);
  }
}
export const dbService = new DbService();
