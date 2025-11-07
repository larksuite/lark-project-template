import { Col, Form, Row, Spin } from "@douyinfe/semi-ui";
import { BriefField, FieldType } from "@lark-project/js-sdk";
import { switchKey } from "../../utils";
import { LinkRenderer, TextRenderer, UserRenderer } from "./Renderers";

interface  IColumnPreviewProps {
  spinning: boolean,
  currentFieldsMap: Map<string, any>,
  groupFieldList: BriefField[][],
}

export const ColumnPreview = (props: IColumnPreviewProps) => {
  const { spinning, groupFieldList,  currentFieldsMap} = props;
    const RenderFormItem = (field: BriefField) => {
    const _getValue = (fieldId) => {
      const value = currentFieldsMap.get(field.id);
      if (fieldId === "owned_project") {
        return value?.name;
      }
      return value;
    };
    const value = _getValue(field.id);
    // 根据字段类型渲染对应的渲染组件
    return switchKey(field.type, {
      [FieldType.text]: () => <TextRenderer value={value} />,
      [FieldType.link]: () => <LinkRenderer value={value} />,
      [FieldType.user]: () => <UserRenderer value={value?.username} />,
      default: () => null,
    });
  };
  const renderFieldList = (list: BriefField[]) =>
    list?.map((item) => (
      <Form.Slot label={item.name} key={item.id}>
        <RenderFormItem {...item} />
      </Form.Slot>
    ));
  return (
    <Spin spinning={spinning}>
      <Form labelPosition="left">
        <Row>
          <Col span={12}>{renderFieldList(groupFieldList[0])}</Col>
          <Col span={10} offset={1}>
            {renderFieldList(groupFieldList[1])}
          </Col>
        </Row>
      </Form>
    </Spin>
  );
};
