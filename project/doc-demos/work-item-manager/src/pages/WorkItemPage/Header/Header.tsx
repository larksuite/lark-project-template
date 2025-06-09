import { ReactElement, useState } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { BriefWorkObject } from '@lark-project/js-sdk';
import { ISelectOption } from '@lark-project/ui-kit-plugin';
import { WorkObjectSelect } from './WorkObjectSelect';
import { IHeaderProps } from './interface';
import styles from './Header.module.less';

/**
 * Header
 */
function Header({
  onWorkItemCreated,
}: IHeaderProps): ReactElement {
  const [workObject, setWorkObject] = useState<BriefWorkObject & { spaceId: string }>();
  return (
    <div className={styles.Header}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <WorkObjectSelect
          value={workObject?.id}
          onChange={(_, obj) => setWorkObject((obj as ISelectOption<BriefWorkObject & { spaceId: string }>)?.data)}
        />
        <Button
          type="primary"
          theme="solid"
          disabled={!workObject}
          onClick={() => {
            if (!workObject) {
              return;
            }
            window.JSSDK.navigation.openWorkItemCreatePage({
              spaceId: workObject?.spaceId,
              workObjectId: workObject.id,
              supportedWorkObjectIds: [workObject.id],
            }, (err, result) => {
              if (err) {
                window.JSSDK.toast.error(err.message);
                return;
              }
              window.JSSDK.toast.success('新建成功');
              onWorkItemCreated?.({
                id: result.workItemId,
                spaceId: workObject.spaceId,
                workObjectId: workObject.id,
                name: '',
              });
            });
          }}
        >
          新建工作项实例
        </Button>
      </div>
    </div>
  );
}

export default Header;
