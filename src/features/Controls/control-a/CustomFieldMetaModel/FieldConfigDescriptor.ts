enum MFormLayoutNodeType {
  ROOT = 'root',
  ELEMENT = 'element',
  SECTION = 'section',
  SEPARATOR = 'separator',
}

export default class FieldConfigDescriptor {
  async layout(props: any): Promise<any> {
    const baseLayout: any = {
      type: MFormLayoutNodeType.ROOT,
      subNodes: [],
    };
    return baseLayout;
  }

  async schemas(props: any): Promise<any[]> {
    return [];
  }
}
