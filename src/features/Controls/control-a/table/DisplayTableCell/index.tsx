import React from 'react';
import { Fragment } from '@lark-project/Pingere';
import { IControlTableCellProps } from '../../../../../constants/type';

const containerStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  fontSize: 12,
  color: '#1C1F23',
  flex: 1,
  fontWeight: 600,
} as const;

const DisplayTableCell = (props: IControlTableCellProps) => {
  const [progress] = React.useState(props.value);

  if (props.column.params.demoMode) {
    return <Fragment style={containerStyles}>配置页不支持展示</Fragment>;
  }

  return (
    <Fragment style={containerStyles}>
      <Fragment style={{ width: 10 }}></Fragment>
      <Fragment
        style={{
          flex: 1,
          height: 4,
          backgroundColor: 'rgba(52, 59, 58, 0.09)',
          textOverflow: 'clip',
        }}
      >
        <Fragment
          style={{
            flex: progress ?? 0,
            height: 4,
            backgroundColor: 'var(--semi-color-success)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
          }}
        ></Fragment>
        <Fragment
          style={{
            flex: 100 - (progress ?? 0),
            height: 4,
            backgroundColor: 'rgba(52, 59, 58, 0)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
          }}
        ></Fragment>
      </Fragment>
      <Fragment style={{ width: 35, justifyContent: 'center' }}>{`${progress ?? 0}%`}</Fragment>
    </Fragment>
  );
};

export default DisplayTableCell;
