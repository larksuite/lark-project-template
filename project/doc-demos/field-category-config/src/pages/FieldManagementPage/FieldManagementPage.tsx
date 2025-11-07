import { Select } from "@lark-project/ui-kit-plugin";
import "./FieldManagementPage.less";
import { useModel } from "./useModel";
import { optionList } from "./const";
import { ColumnPreview } from "./ColumnPreview";
export const FieldManagementPage = () => {
  const {
    selectFieldType,
    setSelectFieldType,
    groupFieldList,
    currentFieldsMap,
    loading,
  } = useModel();

  return (
    <div className="wrapper">
      <Select
        optionList={optionList}
        style={{ width: 320 }}
        placeholder="请选择字段类型"
        value={selectFieldType}
        onChange={(value: string) => setSelectFieldType(value)}
      />
      <ColumnPreview
        spinning={loading}
        groupFieldList={groupFieldList}
        currentFieldsMap={currentFieldsMap}
      />
    </div>
  );
};
