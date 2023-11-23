import { MFieldUsedScene } from '../../../../constants/type';

export enum MFormLayoutNodeType {
  ROOT = 'root',
  ELEMENT = 'element',
  SECTION = 'section',
  SEPARATOR = 'separator',
}

const separatorElement = {
  type: MFormLayoutNodeType.SEPARATOR,
};

/**
 * - 新建页配置
 *   - 新建页可见
 */
export default class FieldConfigDescriptor {
  async layout(props: any): Promise<any> {
    const { scene } = props;
    const baseLayout: any = {
      type: MFormLayoutNodeType.ROOT,
      subNodes: [],
    };

    if (scene === MFieldUsedScene.FORM || scene === MFieldUsedScene.NODE_FORM) {
      baseLayout.subNodes.push(separatorElement);
      baseLayout.subNodes.push({
        type: MFormLayoutNodeType.SECTION,
        label: '新建页配置',
        subNode: [
          {
            type: MFormLayoutNodeType.ELEMENT,
            itemId: 'hidden_in_create',
          },
        ],
      });
      return baseLayout;
    }
    return baseLayout;
  }

  async schemas(props: any): Promise<any[]> {
    return [
      {
        key: 'hidden_in_create',
        label: '新建页可见',
        type: 'oppositeCheckbox',
        noLabel: true,
        initValue: false,
      },
    ];
  }
}
