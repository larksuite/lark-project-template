import { Table, Typography } from "@douyinfe/semi-ui";
import { BriefWorkObject } from "@lark-project/js-sdk";

interface InstanceTableProps {
  allowWorkObjectMap: Map<string, BriefWorkObject>;
  spaceId: string;
  workObjectId: string;
  dataSource: any[]; // openapi 工作项实例列表;
}
export const InstanceTable = ({ spaceId, workObjectId,  allowWorkObjectMap, dataSource }: InstanceTableProps) => {
  const columns = [
    {
      title: "工作项 ID",
      dataIndex: "id",
      width: 200,
      render: (text) => {
        return <div>{text}</div>;
      },
    },
    {
      title: "名称",
      dataIndex: "name",
      width: 400,
      render: (text) => {
        return <Typography.Text link>{text}</Typography.Text>;
      },
      onCell(record) {
        return {
          onClick: async () => {
            // 打开详情页
            await window.JSSDK.navigation.openWorkItemDetailPage({
              spaceId: spaceId,
              workObjectId: workObjectId,
              workItemId: record?.id,
            });
          },
        };
      },
    },
    {
      title: "工作项类型",
      dataIndex: "work_item_type_key",
      width: 400,
      render: (text) => {
        return <div>{allowWorkObjectMap.get(text)?.name || text} </div>;
      },
    },
  ];
  return <Table bordered={true} columns={columns} dataSource={dataSource} />;
};
