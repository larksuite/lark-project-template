import { AUTHORIZATION } from '../constants';
import { request, sdkStorage } from '../utils';

// Fill in the interface for obtaining the token on the server side. 
// For the specific process of obtaining the token, please refer to: https://meego-hc.larkoffice.com/b/helpcenter/1p8d7djs/4id4bvnf
export const loginAuth = async (code: string) =>
  request
    .post<{
      token: string;
      msg: string;
    }>('')
    .then(async res => {
      // Store the token locally. The token needs to be carried when making OpenAPI requests subsequently.
      await sdkStorage.setItem(AUTHORIZATION, JSON.stringify(res.data.token));
      return res.data.msg;
    });
