import { useEffect, useState } from "react";
import useSdkContext from "./useSdkContext";
import { sdk } from "../../utils/jssdk";
import { BriefField } from "@lark-project/js-sdk";

export const useFieldsTypeGroup = () => {
  const [fieldsTypeGroup, setFieldsTypeGroup] = useState({});
  const sdkContext = useSdkContext();
  useEffect(() => {
    (async () => {
      try {
        if (!sdkContext?.activeWorkItem?.id) return;
        const { spaceId, workObjectId } = sdkContext.activeWorkItem;
        // Obtain the field list of the basic information of work item configuration through the SDK.
        const workObject = await sdk.WorkObject.load({
          spaceId,
          workObjectId,
        });
        const { fieldList } = workObject;
        const excludeIds = ["work_item_id", "work_item_type_key"];
        // The field list obtained by the SDK work item configuration
        const workObjectFields = fieldList.filter(
          (item) => !excludeIds.includes(item.id)
        );

        // Group by field type. It is used to render the field list according to the activated tab.
        const obj: Record<string, BriefField[]> = {};
        (workObjectFields || []).forEach((item) => {
          const { type } = item;
          if (obj[type]) {
            obj[type].push(item);
          } else {
            obj[type] = [item];
          }
        });
        setFieldsTypeGroup(obj);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [sdkContext?.activeWorkItem?.id]);
  return fieldsTypeGroup;
};
