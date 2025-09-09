import axios from "axios";
import "./mock/mockServer";
import { WorkItemsByViewIdParams } from "./type";
const ACCESS_TOKN_KEY = 'access_token';
async function isLogin() {
  const tokenStr = await window.JSSDK.storage.getItem(ACCESS_TOKN_KEY);
  if (!tokenStr) {
    return false;
  }
  try {
    // ⚠️ 注意：您可以按自己的规则校验当前登录态的有效性，此处仅作示例
    const { token, expire_time } = JSON.parse(tokenStr);
    if (!token || expire_time <= Date.now()) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
export const loginAuth = async () => {
  const logined = await isLogin();
  if (logined) {
    return true;
  }
  const { code } = await window.JSSDK.utils.getAuthCode();
  try {
      /**
   * response 结构示例
   * { 
   *   token: 'p-49257489-f7d7-4cd6-b34f-98c6b81d****',
   *   expire_time: 1756825975529
   * }
   */
    const response = await axios.get("/mock/loginAuth", {
        params: {
          code,
        },
      }).then(res => res.data);
      if(!response?.token) {
        return false;
      }
      const { token, expire_time } = response;
      try { 
        await window.JSSDK.storage.setItem( 
          ACCESS_TOKN_KEY, 
          JSON.stringify({ 
            token, 
            expire_time, 
          }), 
        ); 
      } catch (e) { 
        // 如本地缓存写入异常也不应影响本次授权成功 
      } 
      return true;
  } catch (error) {
     return false;
  }

};


export const queryWorkItemsByViewId = async (params: WorkItemsByViewIdParams) => {
    const response = await axios.post('/mock/queryWorkItemsByViewId', params).then(res => res.data);
    return response;
}