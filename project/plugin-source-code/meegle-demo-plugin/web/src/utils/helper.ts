import { AUTHORIZATION } from '../constants';
import { sdkStorage } from './sdkAction';

function getAppDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
export const isMobile = getAppDevice();

export const isUrl = url => {
  const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
  const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
  const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;
  if (typeof url !== 'string') {
    return false;
  }

  const match = url.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  const everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (
    localhostDomainRE.test(everythingAfterProtocol) ||
    nonLocalhostDomainRE.test(everythingAfterProtocol)
  ) {
    return true;
  }

  return false;
};
export const validateUrl = (url: string) =>
  new Promise((resolve, reject) => {
    (async () => {
      if (!isUrl(url)) {
        await window.JSSDK.toast.error({
          content: '请输入有效链接',
          duration: 3,
        });
        reject(new Error('url 校验失败'));
      }
      resolve(true);
    })();
  });
export const getToken = async () => {
  let token = '';
  try {
    const storeToken = await sdkStorage.getItem(AUTHORIZATION);
    if (storeToken) {
      token = JSON.parse(storeToken);
    }
  } catch (e) {
    console.log(e.message);
  }
  return {
    [AUTHORIZATION]: token,
  };
};
