import { OutOfLimitError } from "@lark-project/js-sdk";

import { safeJson } from "./safeJson";
export const storage = {
  setItem: async (key: string, value: any) => {
    try {
      await window.JSSDK.storage.setItem(key, safeJson.stringify(value));
    } catch (e) {
      if (e.name === OutOfLimitError.name) {
        console.error(e.originMessage);
      } else {
        console.error(e.message);
      }
    }
  },
  getItem: async <T = unknown> (key: string): Promise<T |undefined>  => {
    try {
      const value =  await window.JSSDK.storage.getItem(key);
      return safeJson.parse<T>(value);
    } catch (e) {
      console.error(e.message);
      return undefined;
    }
  },
  removeItem: async (key: string) => {
    try {
      await window.JSSDK.storage.removeItem(key);
    } catch (e) {
      console.error(e.message);
    }
  },
  clear: async () => {
    try {
      await window.JSSDK.storage.clear();
    } catch (e) {
      console.error(e.message);
    }
  },
};

