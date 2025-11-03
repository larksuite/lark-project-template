import {
  BriefField,
  FieldType,
} from "@lark-project/js-sdk";
import { Select } from "@lark-project/ui-kit-plugin";
import { Col, Form, Row, Spin } from "@douyinfe/semi-ui";
import './FieldManagementPage.less'
import { useModel } from "./useModel";
import { switchKey } from "../../utils";
import { TextRenderer, LinkRenderer, UserRenderer } from "./Renderers";
const optionList = [
  {
    label: "文本",
    value: FieldType.text,
  },
  {
    label: "单选人员",
    value: FieldType.user,
  },
  {
    label: "超链接",
    value: FieldType.link,
  },
];

export const FieldManagementPage = () => {
  const {
    selectFieldType,
    setSelectFieldType,
    groupFieldList,
    currentFieldsMap,
    loading,
  } = useModel();

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
    <div className="wrapper">
      <Select
        optionList={optionList}
        style={{ width: 320 }}
        placeholder="请选择字段类型"
        value={selectFieldType}
        onChange={(value: string) => setSelectFieldType(value)}
      />
      <Spin spinning={loading}>
        <Form labelPosition="left" key={selectFieldType}>
          <Row>
            <Col span={12}>{renderFieldList(groupFieldList[0])}</Col>
            <Col span={10} offset={1}>
              {renderFieldList(groupFieldList[1])}
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};
