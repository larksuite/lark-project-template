import React, { createContext, useEffect, useState } from "react";
import { Context, unwatch } from "@lark-project/js-sdk";
import { sdk } from "../../../utils/jssdk";

const SDKContext = createContext<Context | undefined>(undefined);
function SDKContextProvider({ children }) {
  const [context, setContext] = useState<Context | undefined>();
  useEffect(() => {
    let unwatch: unwatch | undefined;
    (async () => {
      try {
        sdk.Context.load().then((ctx) => {
          setContext(ctx);
          unwatch = ctx.watch((nextCtx) => {
            setContext(nextCtx);
          });
        });
      } catch (error) {
        console.log(error);
      }
    })();
    return () => {
      unwatch?.();
    };
  }, []);
  return <SDKContext.Provider value={context}>{children}</SDKContext.Provider>;
}

export { SDKContextProvider, SDKContext };
