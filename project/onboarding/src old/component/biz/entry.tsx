import React from 'react';
import { ErrorBoundary } from './errorBoundary';
import { Login } from './login';
import { ColorScheme } from './colorScheme';

export function Entry(props: React.PropsWithChildren) {
  return (
    <ErrorBoundary>
      <ColorScheme>
        <Login>{props.children}</Login>
      </ColorScheme>
    </ErrorBoundary>
  );
}
