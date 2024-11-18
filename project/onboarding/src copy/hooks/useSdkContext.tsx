import type { Context, unwatch } from '@lark-project/js-sdk';
import { useEffect, useState } from 'react';

const useSdkContext = () => {
  const [context, setContext] = useState<Context | undefined>();
  useEffect(() => {
    let unwatch: unwatch | undefined;
    (async () => {
      try {
        window.JSSDK.Context.load().then(ctx => {
          setContext(ctx);
          unwatch = ctx.watch(nextCtx => {
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

  return context;
};
export default useSdkContext;
