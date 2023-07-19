import SDKClient, { SDKClientOptions } from '@lark-project/js-sdk';
import { PLUGIN_ID } from '../constants';

class SDKManager {
  configured: boolean;
  options: SDKClientOptions;
  sdk: SDKClient;
  constructor(options: SDKClientOptions) {
    this.options = options;
    this.sdk = new SDKClient();
  }

  getSdkInstance = async (): Promise<SDKClient> => {
    if (this.configured) {
      return this.sdk;
    }
    try {
      await this.sdk.config(this.options);
      this.configured = true;
    } catch (error) {
      console.error('SDK 调用失败', error);
    }
    return this.sdk;
  };
}

export const sdkManager = new SDKManager({
  pluginId: PLUGIN_ID,
  isDebug: false,
});
