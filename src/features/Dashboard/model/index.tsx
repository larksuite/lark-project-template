import { useEffect, useState } from 'react';
import { Context, BriefField, WorkItem } from '@lark-project/js-sdk';
import { Toast } from '@douyinfe/semi-ui';
import SDKClient from '@lark-project/js-sdk';
import { sdkManager } from '../../../utils';
import useSdkContext from '../../../hooks/useSdkContext';

interface Document {
  key: string;
  value: string;
}
const useModel = () => {
  const [sdk, setSdk] = useState<SDKClient>();
  const [fieldList, setFieldList] = useState<BriefField[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workItem, setWorkItem] = useState<WorkItem>();
  const content: Context | undefined = useSdkContext();

  useEffect(() => {
    (async () => {
      const sdk = await sdkManager.getSdkInstance();
      setSdk(sdk);
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
    if (!sdk || !content?.activeWorkItem) return;
    const { spaceId, workObjectId, id } = content?.activeWorkItem;
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
  }, [content?.activeWorkItem]);

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
