import type { NextApiRequest, NextApiResponse } from 'next';
import { pluginConfig } from '../../src/config/index';
import { request } from '../../src/utils';
import { dbService } from '../../src/service/db';
import { AllowMethods, ControlExposeHeaders, IUserPluginToken } from '../../src/types';
import { jwtSignAsync } from '../../src/utils/jwt';
import { errorMiddleware } from 'src/middleware';
// openapi 有效期最后 5 分钟刷新 token
const LAST_REFRESH_TIME = 1000 * 60 * 5;
const fetchPluginToken = async () => {
  const pluginToken = await dbService.getPluginToken();
  if (pluginToken && pluginToken.expire_time - Date.now() > 0) {
    return pluginToken.token;
  }
  const response = await request({
    method: 'POST',
    url: '/authen/plugin_token',
    data: {
      plugin_id: pluginConfig.PLUGIN_ID,
      plugin_secret: pluginConfig.PLUGIN_SECRET,
      type: pluginConfig.PLUGIN_TOKEN_TYPE,
    },
  });
  dbService.setPluginToken({
    token: response.data?.data?.token,
    expire_time: Date.now() + (response.data?.data?.expire_time * 1000 || 0) - LAST_REFRESH_TIME,
  });
  return response.data?.data?.token || '';
};
const fetchUserPluginToken = async (
  code: string,
  pluginToken: string,
): Promise<IUserPluginToken> => {
  const response = await request({
    method: 'POST',
    url: '/authen/user_plugin_token',
    data: {
      code,
      grant_type: 'authorization_code',
    },
    headers: {
      'x-plugin-token': pluginToken,
    },
  });
  const userPlguinData = response.data?.data;
  if (userPlguinData?.user_key) {
    await dbService.setUerPluginToken({
      [userPlguinData.user_key]: {
        ...userPlguinData,
        expire_time: Date.now() + (userPlguinData?.expire_time * 1000 || 0) - LAST_REFRESH_TIME,
      },
    });
  }
  return response.data?.data || {};
};
const allowMethod = AllowMethods.POST;

export default function (req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (Array.isArray(code)) {
    return res.status(400).json({
      msg: 'Parameter not legal, code must string',
    });
  }
  const handler = async () => {
    const pluginToken = await fetchPluginToken();
    const userpluginRes = await fetchUserPluginToken(code, pluginToken);
    const { user_key = '' } = userpluginRes;
    const jwt = await jwtSignAsync({
      user_key,
    });
    res.setHeader(ControlExposeHeaders.AUTHORIZATION, jwt);
    res.setHeader('Access-Control-Expose-Headers', ControlExposeHeaders.AUTHORIZATION);
    res.status(200).json({
      msg: 'success',
    });
  };
  switch (req.method) {
    case allowMethod:
      return errorMiddleware(res, handler);
    default:
      res.status(405).json({
        msg: 'Method not allowed',
      });
      return;
  }
}
