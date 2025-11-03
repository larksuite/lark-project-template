import {
  BriefField,
  FieldType,
  TabFeatureContext,
  WorkItem,
  WorkObject,
} from "@lark-project/js-sdk";
import { useEffect, useMemo, useState } from "react";

const useTabContext = () => {
  const [tabContext, setTabContext] = useState<TabFeatureContext>();
  const getTabContext = async () => {
    try {
      const context = await window.JSSDK.tab.getContext();
      setTabContext(context);
    } catch (error) {}
  };
  useEffect(() => {
    getTabContext();
  }, []);
  return { tabContext };
};
const useFieldList = (context?: TabFeatureContext) => {
  const [fieldList, setFieldList] = useState<BriefField[]>([]);
  const getFieldList = async (ctx: TabFeatureContext) => {
    try {
      const workObject: WorkObject = await window.JSSDK.WorkObject.load({
        spaceId: ctx.spaceId,
        workObjectId: ctx.workObjectId,
      });
      setFieldList(workObject?.fieldList || []);
    } catch (error) {}
  };
  useEffect(() => {
    if (!context) return;
    getFieldList(context);
  }, [context]);
  return {
    fieldList,
  };
};
const useWorkItemInfo = (context?: TabFeatureContext) => {
  const [workItemInfo, setWorkItemInfo] = useState<WorkItem>();

  const getWorkItemInfo = async (ctx: TabFeatureContext) => {
    try {
      const workItem: WorkItem = await window.JSSDK.WorkItem.load({
        spaceId: ctx.spaceId,
        workItemId: ctx.workItemId,
        workObjectId: ctx.workObjectId,
      });
      setWorkItemInfo(workItem);
    } catch (error) {}
  };
  useEffect(() => {
    if (!context) return;
    getWorkItemInfo(context);
  }, [context]);
  return { workItemInfo };
};
const useFieldsMap = (filterFieldList, workItemInfo?: WorkItem) => {
  const [currentFieldsMap, setCurrentFieldsMap] = useState<Map<string, any>>(
    new Map()
  );
  const [loading, setLoading] = useState<boolean>(false)
  const getFieldValues = async (fields: BriefField[]) => {
    if (!workItemInfo || !fields?.length) return;
      setLoading(true)
    // 需要将 tsconfig.json 的 lib 配置项, 添加 ES2020, 否则会有类型提示 allSettled 不存在
    const results = await Promise.allSettled(
      fields.map(async (field) => ({
        id: field.id,
        value: await workItemInfo.getFieldValue(field.id),
      }))
    );
    // 过滤成功的结果并转换为Map
    const map =  new Map(
      results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<{ id: string; value: any }> =>
            result.status === "fulfilled"
        )
        .map((fulfilled) => [fulfilled.value.id, fulfilled.value.value])
    );
    setLoading(false);
    return map;
  };
  useEffect(() => {
    getFieldValues(filterFieldList).then((values) => {
      values && setCurrentFieldsMap(values);
    });
  }, [filterFieldList, workItemInfo]);
  return {
    currentFieldsMap,
    loading,
  };
};
export const useModel = () => {
  const [selectFieldType, setSelectFieldType] = useState<string>(
    FieldType.text
  );
  const { tabContext } = useTabContext();
  const { fieldList } = useFieldList(tabContext);
  const { workItemInfo } = useWorkItemInfo(tabContext);
  const filterFieldList = useMemo(() => {
    return fieldList?.length
      ? fieldList.filter((item) => item.type === selectFieldType)
      : [];
  }, [fieldList, selectFieldType]);
  const { currentFieldsMap, loading } = useFieldsMap(filterFieldList, workItemInfo);
    const groupFieldList = useMemo(() => {
    return filterFieldList.length
      ? filterFieldList.reduce(
          ([left, right], item, index) =>
            index % 2 ? [left, [...right, item]] : [[...left, item], right],
          [[], []] as [BriefField[], BriefField[]]
        )
      : [[], []];
  }, [filterFieldList]);
  return {
    selectFieldType,
    setSelectFieldType,
    groupFieldList,
    currentFieldsMap,
    loading,
  };
};
