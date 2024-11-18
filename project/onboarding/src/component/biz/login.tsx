import React, { useEffect, useState } from 'react';
import { LoginContext } from '../../hooks';
import { loginAuth } from '../../api';
import { sdkStorage } from '../../utils';
import { sdk } from '../../jssdk';

export function Login(props: React.PropsWithChildren) {
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const { code } = await sdk.utils.getAuthCode();
        const result = await loginAuth(code);
        if (result?.msg === 'success') {
          setIsLogin(true);
        }
      } catch (error) {
        console.log(error);
      }
    })();
    return () => {
      sdkStorage.clear();
    };
  }, []);
  return <LoginContext.Provider value={isLogin}>{props.children}</LoginContext.Provider>;
}
