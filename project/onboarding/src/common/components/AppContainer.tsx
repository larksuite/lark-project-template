import React from "react";
import { Login } from "../hoc/with-authorization";
import { ColorScheme } from "../hoc/with-color-schema";

export function AppContainer(props: React.PropsWithChildren) {
  return (
    <ColorScheme>
      <Login>{props.children}</Login>
    </ColorScheme>
  );
}
