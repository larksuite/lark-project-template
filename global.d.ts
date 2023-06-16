// static resource
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

// The third party module injected by the Lark Project
declare module '@lark-project/MeegoComponent';
declare module '@lark-project/GeneralForm';
declare module '@lark-project/GeneralTable';
declare module '@lark-project/Pingere';
declare module '@lark-project/PingereDefinitions';
declare module '@lark-project/BasePlugin';
