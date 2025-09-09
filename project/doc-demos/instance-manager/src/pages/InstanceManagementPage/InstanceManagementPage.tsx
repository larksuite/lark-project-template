import { BriefWorkObject, ViewFeatureContext } from "@lark-project/js-sdk";
import { useEffect, useMemo, useState } from "react";
import { InstanceTable } from "./InstanceTable";
import { loginAuth, queryWorkItemsByViewId } from "../../apis";
import { IWorkItemFinderProps, WorkItemFinder } from "@lark-project/ui-kit-plugin";

type onSubmitParams = Parameters<NonNullable<IWorkItemFinderProps['onSubmit']>>[0];
// 获取视图上下文
const useViewContext = () => {
  const [viewContext, setViewContext] = useState<ViewFeatureContext>();
  const getViewConText = async () => {
    try {
      const viewCtx = await window.JSSDK.view.getContext();
      setViewContext(viewCtx);
    } catch (error) {}
  };
  useEffect(() => {
    getViewConText();
  }, []);
  return viewContext;
};
// 获取空间信息
const useSpaceInfo = (spaceId) => {
  const [allWorkObjectList, setAllWorkObjectList] = useState<BriefWorkObject[]>(
    []
  );
  useEffect(() => {
    if (!spaceId) {
      return;
    }
    window.JSSDK.Space.load(spaceId).then((res) => {
      setAllWorkObjectList(res.allWorkObjectList || []);
    });
  }, [spaceId]);
  const allowWorkObjectIds = useMemo(
    () => (allWorkObjectList || [])?.map((item) => item.id) || [],
    [allWorkObjectList]
  );
  const allowWorkObjectMap = useMemo(() => {
    return new Map(allWorkObjectList.map((item) => [item.id, item]));
  }, [allWorkObjectList]);
  return {
    allowWorkObjectIds,
    allowWorkObjectMap,
  };
};

export function InstanceManagementPage() {
  const [loginIn, setLoginIn] = useState(false);
  const viewContext = useViewContext();
  const [searchId, setSearchId] = useState<string>();
  const spaceId = viewContext?.spaceId || "";
  const workObjectId = viewContext?.workObjectId || "";
  const viewId = viewContext?.viewId || "";
  const { allowWorkObjectMap, allowWorkObjectIds } = useSpaceInfo(spaceId);
  const [dataList, setDataList] = useState<any[]>([]);
  
  useEffect(() => {
    loginAuth().then((res) => {
      setLoginIn(res);
    });
  }, []);

  const getWorkItemsInfoByViewId = async(quickFilterId?: string) => {
    const response = await queryWorkItemsByViewId({
      project_key: spaceId,
      view_id: viewId,
      quick_filter_id: quickFilterId || "",
      work_item_type_keys: allowWorkObjectIds,
    });
    setDataList(response.data);
  };

  useEffect(() => {
    if (
      [loginIn, spaceId, viewId, allowWorkObjectIds.length].some(
        (item) => !item
      )
    ) {
      return;
    }
    getWorkItemsInfoByViewId();
  }, [loginIn, spaceId, viewId, allowWorkObjectIds]);

  const onSubmit = (val: onSubmitParams) => {
    setSearchId(val.searchId);
    getWorkItemsInfoByViewId(val.searchId);
  }
  return (
    <div>
      <WorkItemFinder
        spaceId={spaceId}
        workObjectId={workObjectId}
        searchId={searchId}
        onSubmit={onSubmit}
      />
      <InstanceTable
        spaceId={spaceId}
        workObjectId={workObjectId}
        allowWorkObjectMap={allowWorkObjectMap}
        dataSource={dataList}
      />
    </div>
  );
}
