import { ReactElement } from 'react';
import { useRefer } from '../../utils';
import { Header } from './Header';
import { FieldTable, type IFieldTableProps } from './FieldTable';
import styles from './CustomField.module.less';

function CustomField(): ReactElement {
  const refer = useRefer<Required<IFieldTableProps>['refer']>();
  return (
    <div className={styles.CustomField}>
      <Header onFieldCreated={() => refer.refresh?.()} />
      <FieldTable refer={refer} />
    </div>
  );
}

export default CustomField;
