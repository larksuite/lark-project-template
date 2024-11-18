import { useEffect } from 'react';
import { useSdkContext } from '../../hooks';
import { THEME_ATTRIBUTE } from '../../constants';
import { Mode } from '../../types';
import './colorScheme.less';

export function ColorScheme(props) {
  const context = useSdkContext();
  const changeColorScheme = () => {
    const { body } = document;
    const colorScheme = context?.colorScheme;
    if (colorScheme === Mode.DARK) {
      body.setAttribute(THEME_ATTRIBUTE, Mode.DARK);
    } else {
      body.removeAttribute(THEME_ATTRIBUTE);
    }
  };
  useEffect(() => {
    changeColorScheme();
  }, [context?.colorScheme]);
  return props.children;
}
