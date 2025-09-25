import { ReactElement } from 'react';
import { Button } from '@douyinfe/semi-ui';
import { IHeaderProps } from './interface';
import styles from './Header.module.less';

function Header({
  onFieldCreated,
}: IHeaderProps): ReactElement {
  return (
    <div className={styles.Header}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <Button
          type="primary"
          theme="solid"
          onClick={() => {
            window.JSSDK.modal.open({
              entry: 'CREATE_CUSTOM_FIELD',
              onSubmit: onFieldCreated,
            });
          }}
        >
          新建自定义字段
        </Button>
      </div>
    </div>
  );
}

export default Header;
