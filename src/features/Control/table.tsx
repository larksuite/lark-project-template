import React, { useState, useEffect } from 'react';
import { Fragment } from '@lark-project/Pingere';

const RenderControlTableJSX = () => {
  const [progress, setProgress] = useState<number>();
  useEffect(() => {
    setTimeout(() => {
      setProgress(70);
    }, 1000);
  }, []);

  if (!progress) {
    <Fragment>暂无</Fragment>;
  }
  return (
    <Fragment
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        fontSize: 12,
        color: '#1C1F23',
        flex: 1,
        fontWeight: 600,
      }}
    >
      <Fragment style={{ width: 10 }}></Fragment>
      <Fragment
        style={{
          flex: 1,
          height: 4,
          backgroundColor: 'rgba(52, 59, 58, 0.09)',
          overflow: 'hidden',
        }}
      >
        <Fragment
          style={{
            flex: progress ?? 0,
            flexShrink: 0,
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
            flexShrink: 0,
            height: 4,
            backgroundColor: 'rgba(52, 59, 58, 0)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
          }}
        ></Fragment>
      </Fragment>
      <Fragment style={{ width: 35, display: 'flex', justifyContent: 'center' }}>{`${
        progress ?? 0
      }%`}</Fragment>
    </Fragment>
  );
};
export default RenderControlTableJSX;
