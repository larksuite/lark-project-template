import SDKClient, { SDKClientOptions } from '@lark-project/js-sdk';
import { PLUGIN_ID } from '../constants';

class SDK {
  configured: boolean;
  options: SDKClientOptions;
  sdk: SDKClient;
  constructor(options: SDKClientOptions) {
    this.options = options;
    this.sdk = new SDKClient();
  }

  config = async (): Promise<SDKClient> => {
    if (this.configured) {
      return this.sdk;
    }
    await this.sdk.config(this.options);
    this.configured = true;
    return this.sdk;
  };
}

export const sdkInstance = new SDK({
  pluginId: PLUGIN_ID,
  isDebug: true,
});
