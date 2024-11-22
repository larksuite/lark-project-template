import { useCallback } from 'react';
import { useSdkContext } from '.';
import translation from '../../constants/translation.json';

// Multilingual ability.
export const useI18n = () => {
  const context = useSdkContext();
  const lang = context?.language ?? 'zh_CN';
  const i18n = useCallback(
    (key, propsMap = {}) => {
      const text = translation[key][lang];
      let finalText = text;
      if (!text) {
        return key;
      }
      for (const prop in propsMap) {
        const regex = new RegExp(`{${prop}}`, 'g');
        finalText = text.replace(regex, propsMap[prop]);
      }
      return finalText;
    },
    [lang],
  );
  return i18n;
};
