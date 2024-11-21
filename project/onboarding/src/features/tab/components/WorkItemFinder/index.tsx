import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { useSdkContext } from '../../../../common/hooks';
import { useI18n } from '../../../../common/hooks/useI18n';
import { sdk } from '../../../../utils/jssdk';

export const WorkItemFinder = () => {
  const [spaceId, setSpaceId] = useState<string>();
  const [workObjectId, setWorkObjectId] = useState<string>();
  const [searchIdValue, setSearchIdValue] = useState<string>();
  const sdkContext = useSdkContext();
  const i18n = useI18n();
  useEffect(() => {
    const { spaceId, workObjectId } = sdkContext?.activeWorkItem ?? {};
    setSpaceId(spaceId);
    setWorkObjectId(workObjectId);
  }, [sdkContext]);
  const open = useCallback(async () => {
    try {
      await sdk.workItemFinder.open(
        {
          spaceId: spaceId!,
          workObjectId: workObjectId!,
          title: i18n('filter'),
          searchId: searchIdValue,
        },
        ({ confirmed, canceled, searchId }) => {
          if (confirmed) {
            sdk.toast.success(i18n('generateIdSuccessfully', { searchId }));
            setSearchIdValue(searchId);
          }
          if (canceled) {
            sdk.toast.info(i18n('cancelGenerateId'));
          }
        },
      );
    } catch (e) {
      sdk.toast.error(JSON.stringify(e));
    }
  }, [spaceId, searchIdValue, workObjectId]);
  return <Button onClick={open}>{i18n('filter')}</Button>;
};
