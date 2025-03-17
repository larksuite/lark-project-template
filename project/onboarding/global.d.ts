import type { SDKClient } from '@lark-project/js-sdk';

declare global {
  interface Window {
    JSSDK: SDKClient;
  }

  declare module '*.png';
  declare module '*.jpg';
  declare module '*.jpeg';
  declare module '*.gif';
  declare module '*.webp';
  declare module '*.ttf';
  declare module '*.woff';
  declare module '*.woff2';
  declare module '*.less';
  declare module '*.mp4';
  declare module '*.svg' {
    const content: any;
    export default content;
  }
}
