import { OutOfLimitError } from '@lark-project/js-sdk';
import { sdk } from './jssdk';

export const sdkStorage = {
  async setItem(key: string, data) {
    try {
      await sdk.storage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // When the plugin storage exceeds the limit, an OutOfLimitError will be thrown.
      if (e.name === OutOfLimitError.name) {
        console.log(e.originMessage);
      } else {
        console.log(e.message);
      }
    }
  },
  async getItem(key: string) {
    try {
      return await sdk.storage.getItem(key); // '{"token":"xyz"}
    } catch (e) {
      console.log(e.message);
      return null;
    }
  },
  async clear() {
    try {
      await sdk.storage.clear();
    } catch (e) {
      console.log(e.message);
    }
  },
};
