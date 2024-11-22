import { AUTHORIZATION } from '../constants';
import { sdkStorage } from './sdkAction';

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

// Get the token stored locally.
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
