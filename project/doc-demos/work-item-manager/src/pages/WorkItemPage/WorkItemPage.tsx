import { ReactElement, useCallback, useEffect, useState } from 'react';
import { BriefWorkItem } from '@lark-project/js-sdk';
import { Header } from './Header';
import { WorkItemTable } from './WorkItemTable';

/**
 * WorkItemPage
 */
function WorkItemPage(): ReactElement {
  const [workItems, setWorkItems] = useState<BriefWorkItem[]>([]);
  // 初始查询本地缓存
  useEffect(() => {
    (async () => {
      let workItemsStr = await window.JSSDK.storage.getItem('workItems');
      if (!workItemsStr) {
        workItemsStr = '[]';
      }
      const workItemList = JSON.parse(workItemsStr);
      setWorkItems(workItemList);
    })();
  }, []);
  // 实例创建后存储到本地
  const onWorkItemCreated = useCallback(async (workItem: BriefWorkItem) => {
    let workItemsStr = await window.JSSDK.storage.getItem('workItems');
    if (!workItemsStr) {
      workItemsStr = '[]';
    }
    const workItemList = JSON.parse(workItemsStr);
    workItemList.push(workItem);
    window.JSSDK.storage.setItem('workItems', JSON.stringify(workItemList));
    setWorkItems(workItemList);
  }, []);
  const onRemoveWorkItem = useCallback((workItemId: number) => {
    const list = workItems.filter(item => item.id !== workItemId);
    setWorkItems(list);
    window.JSSDK.storage.setItem('workItems', JSON.stringify(list));
    window.JSSDK.toast.success('已从缓存删除');
  }, [workItems]);
  return (
    <div>
      {/* 标题栏 */}
      <Header onWorkItemCreated={onWorkItemCreated} />
      <WorkItemTable workItems={workItems} onRemoveWorkItem={onRemoveWorkItem} />
    </div>
  );
}

export default WorkItemPage;
