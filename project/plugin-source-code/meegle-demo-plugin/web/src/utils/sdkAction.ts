import { OutOfLimitError } from '@lark-project/js-sdk';

export const sdkStorage = {
  async setItem(key: string, data) {
    try {
      await window.JSSDK.storage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // 当插件存储超出限额时，会抛 OutOfLimitError
      if (e.name === OutOfLimitError.name) {
        console.log(e.originMessage);
      } else {
        console.log(e.message);
      }
    }
  },
  async getItem(key: string) {
    try {
      return await window.JSSDK.storage.getItem(key); // '{"token":"xyz"}
    } catch (e) {
      console.log(e.message);
      return null;
    }
  },
  async clear() {
    try {
      await window.JSSDK.storage.clear();
    } catch (e) {
      console.log(e.message);
    }
  },
};

export const copyClipboard = async (text: string) => {
  try {
    // TODO: 现 代码逻辑异常，复制成功返回的表示也是 fasle;
    return await window.JSSDK.clipboard.writeText(text);
  } catch (e) {
    // 当字符串长度大于 1000 字符时，会抛 OutOfLimitError
    if (e.name === OutOfLimitError.name) {
      console.error(e.originMessage);
    } else {
      console.error(e.message);
    }
    return null;
  }
};
