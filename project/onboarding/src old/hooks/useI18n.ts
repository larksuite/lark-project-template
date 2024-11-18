import { useCallback } from 'react';
import { useSdkContext } from '.';
import translation from '../translation.json';
export const useI18n = () => {
  const context = useSdkContext();
  const lang = context?.language ?? 'zh_CN';
  const i18n = useCallback(key => translation[key][lang], [lang]);
  return i18n;
};
