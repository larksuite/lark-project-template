import { useEffect } from 'react';
import { THEME_ATTRIBUTE } from '../../../constants';
import { Mode } from '../../../constants/types';
import { useSdkContext } from '../../hooks';
import './index.less';

// Dark mode
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
