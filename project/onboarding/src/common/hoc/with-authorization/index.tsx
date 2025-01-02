import React, { useEffect, useState } from 'react';
import { loginAuth } from '../../../api';
import { sdkStorage } from '../../../utils';
import { sdk } from '../../../utils/jssdk';
import { LoginContext } from '../../hooks';

export function Login(props: React.PropsWithChildren) {
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const { code } = await sdk.utils.getAuthCode();
        const result = await loginAuth(code);
        // After obtaining the token, the login is successful.
        const GET_TOKEN_SUCCESS = false;
        if (GET_TOKEN_SUCCESS) {
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
