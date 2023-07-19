import { Context, unwatch } from '@lark-project/js-sdk';
import { useEffect, useState } from 'react';
import { sdkManager } from '../utils';

const useSdkContext = () => {
  const [context, setContext] = useState<Context | undefined>();
  useEffect(() => {
    let unwatch: unwatch | undefined;
    (async () => {
      try {
        const sdk = await sdkManager.getSdkInstance();
        sdk.Context.load().then(ctx => {
          setContext(ctx);
          unwatch = ctx.watch(nextCtx => {
            setContext(nextCtx);
          });
        });
      } catch (e) {}
    })();
    return () => {
      unwatch?.();
    };
  }, []);

  return context;
};
export default useSdkContext;
