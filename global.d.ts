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
declare module '@lark-project/BasePlugin';
declare module 'useSafeFormikFieldState' {
  function useSafeFormikFieldState(fieldId: string): [
    {
      // 字段 id
      name: string;
      // 字段值
      value: any;
    },
  ];
}

// declare Pingere
interface PingereWidgetInterface {
  children?: ReactNode;
  clipable?: boolean;
  dom?: ReactNode;
  style?: {
    position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
    padding?:
      | number
      | {
          top: number;
          right: number;
          bottom: number;
          left: number;
        };
    borderWidth?:
      | number
      | {
          top: number;
          right: number;
          bottom: number;
          left: number;
        };
    margin?:
      | number
      | {
          top: number;
          right: number;
          bottom: number;
          left: number;
        };
    borderRadius?:
      | number
      | {
          tl: number;
          tr: number;
          bl: number;
          br: number;
        };
    flex?:
      | number
      | {
          grow: number;
          shrink: number;
          basis: number;
        };
    color?: string;
    lineHeight?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number | string;
    textAlign?: 'left' | 'right' | 'center';
    textOverflow?: 'visible' | 'wrap' | 'clip' | 'ellipsis';
    width?: number;
    height?: number;
    top?: number;
    left?: number;
    right?: number;
    backgroundColor?: string;
    borderColor?: string;
    flexDirection?: 'row' | 'column';
    alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center';
    justifyContent?:
      | 'stretch'
      | 'flex-start'
      | 'flex-end'
      | 'center'
      | 'space-between'
      | 'space-around';
    cursor?: string;
    zIndex?: number;
    lineDash?: number[];
    transform?: {
      x?: number;
      y?: number;
      z?: number;
    };
    pointerEvents?: 'auto' | 'none';
    sticky?: {
      x: boolean;
      y: boolean;
    };
  };
  hoverStyle?: {
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
  };
  interactive?: boolean;
  key?: string;
  onClick?: (e: any) => void;
  onDblClick?: (e: any) => void;
  onDragOver?: (e: any) => void;
  onDrop?: (e: any) => void;
  onLeave?: (e: any) => void;
  onMouseDown?: (e: any) => void;
  onMouseMove?: (e: any) => void;
  onMouseUp?: (e: any) => void;
  onOn?: (e: any) => void;
  onWheel?: (e: any) => void;
  visible?: boolean;
}

declare module '@lark-project/PingereDefinitions';
declare module '@lark-project/Pingere' {
  declare const Fragment: import('react').ForwardRefExoticComponent<
    PingereWidgetInterface & import('react').RefAttributes<unknown>
  >;
  declare const Text: React.ForwardRefExoticComponent<
    PingereWidgetInterface & {
      maxLines?: number;
      maxWidth?: number;
    } & React.RefAttributes<unknown>
  >;
  export declare const Image: React.ForwardRefExoticComponent<
    PingereWidgetInterface & {
      url: string;
      objectFit?: 'fill' | 'aspect-fit' | 'aspect-fill';
      circular?: boolean;
      opacity?: number;
      onLoad?: () => void;
      onError?: () => void;
    } & React.RefAttributes<unknown>
  >;
}
