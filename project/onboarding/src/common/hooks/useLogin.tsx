import { createContext, useContext } from 'react';

// The functions of the plugin can be controlled through isLogin.
export const LoginContext = createContext(false);
export const useLogin = () => useContext(LoginContext);
