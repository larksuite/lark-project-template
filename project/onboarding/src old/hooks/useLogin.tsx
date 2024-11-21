import { createContext, useContext } from 'react';

export const LoginContext = createContext(false);
export const useLogin = () => useContext(LoginContext);
