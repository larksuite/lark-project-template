import React from 'react';
import { Login } from './login';
import { ColorScheme } from '../with-color-schema';

export function Entry(props: React.PropsWithChildren) {
  return (
    <ColorScheme>
      <Login>{props.children}</Login>
    </ColorScheme>
  );
}
