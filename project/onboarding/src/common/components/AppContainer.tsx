import React from "react";
import { Login } from "../hoc/with-authorization";
import { ColorScheme } from "../hoc/with-color-schema";
import { SDKContextProvider } from "../hoc/with-context";

export function AppContainer(props: React.PropsWithChildren) {
  return (
    <SDKContextProvider>
      <ColorScheme>
        <Login>{props.children}</Login>
      </ColorScheme>
    </SDKContextProvider>
  );
}
