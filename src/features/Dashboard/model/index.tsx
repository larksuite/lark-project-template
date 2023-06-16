import { useEffect, useState } from 'react';
import { Cursor, BriefField, WorkItem } from '@lark-project/js-sdk';
import { Toast } from '@douyinfe/semi-ui';
import SDKClient from '@lark-project/js-sdk';
import { sdkInstance } from '../../../utils';

interface Document {
  key: string;
  value: string;
}
const useModel = () => {
  const [sdk, setSdk] = useState<SDKClient>();
  const [fieldList, setFieldList] = useState<BriefField[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workItem, setWorkItem] = useState<WorkItem>();
  const [detailPage, setDetailPage] = useState<Cursor['detailPage']>();
  const { activeWorkItem } = detailPage || {};

  useEffect(() => {
    (async () => {
      try {
        const sdk = await sdkInstance.config();
        sdk.cursor.watch(nextValue => {
          setDetailPage(nextValue.detailPage);
        });
        setDetailPage(sdk?.cursor?.detailPage);
        setSdk(sdk);
      } catch (error) {
        console.error('SDK 调用失败', error);
      }
    })();
  }, []);

  const fetchDocuments = async (fields: BriefField[], workItem: WorkItem) => {
    let result: Document[] = [];
    const requests = fields.map(field => workItem.getFieldValue(field.id));
    await Promise.all(requests).then(results => {
      for (let i = 0; i < fields.length; i++) {
        result.push({
          key: fields[i].name,
          value: results[i],
        });
      }
    });
    setDocuments(result);
  };

  useEffect(() => {
    if (!sdk || !activeWorkItem) return;
    const { spaceId, workObjectId, id } = activeWorkItem;
    (async () => {
      try {
        const detail = await sdk.WorkItem.load({
          spaceId,
          workObjectId,
          workItemId: id,
        });
        const data = await sdk.WorkObject.load({
          spaceId,
          workObjectId,
        });
        setWorkItem(detail);
        setFieldList(data.fieldList ?? []);
      } catch (e) {
        Toast.error(e.message);
      }
    })();
  }, [sdk, activeWorkItem]);

  useEffect(() => {
    if (!Array.isArray(fieldList) || fieldList.length === 0 || !workItem) {
      return;
    }
    fetchDocuments(
      fieldList.filter(field => field.type === 'link'),
      workItem,
    );
  }, [fieldList, workItem]);

  return { documents };
};

export default useModel;
