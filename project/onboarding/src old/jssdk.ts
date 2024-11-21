import type { SDKClient } from '@lark-project/js-sdk';

declare global {
  interface Window {
    JSSDK: SDKClient;
  }
}

export const sdk = window.JSSDK;
