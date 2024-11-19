import { AUTHORIZATION } from '../constants';
import { request, sdkStorage } from '../utils';

// 填入服务端中获取token的接口，获取token具体流程详见：https://meego-hc.larkoffice.com/b/helpcenter/1p8d7djs/4id4bvnf
export const loginAuth = async (code: string) =>
  request
    .post<{
      token: string;
      msg: string;
    }>('')
    .then(async res => {
      // 将token存储到本地，后续使用openapi请求时需要携带token
      await sdkStorage.setItem(AUTHORIZATION, JSON.stringify(res.data.token));
      return res.data.msg;
    });
