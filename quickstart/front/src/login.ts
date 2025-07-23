import { TOKEN_EXPIRE_KEY, TOKEN_KEY } from './constants';
import request from './request';

async function checkLogin() {
  const token = await window.JSSDK.storage.getItem(TOKEN_KEY);
  const expireTime = await window.JSSDK.storage.getItem(TOKEN_EXPIRE_KEY);
  if (!token || !expireTime || Number(expireTime) - Number(new Date()) <= 0) {
    return false;
  }
  return true;
}

async function getToken(code) {
  try {
    const res = await request.post('https://byd.xiongdianpku.com/demo/login', {
      code,
    });
    const { token, expire_time } = res.data.data;
    // expire_time示例值 7200 秒，这里累加当前时间，再减去五分钟，作为最终失效时间
    await window.JSSDK.storage.setItem(TOKEN_KEY, token);
    // 前端比后端的过期时间早五分钟
    await window.JSSDK.storage.setItem(
      TOKEN_EXPIRE_KEY,
      String(expire_time * 1000 + Number(new Date()) - 300000),
    );
    return true;
  } catch (error) {
    console.error(error);
    return Error(error);
  }
}

export default async function login() {
  const login = await checkLogin();
  if (!login) {
    const code = await window.JSSDK.utils.getAuthCode();
    await getToken(code?.code || '');
  }
}
