import { NextApiRequest } from 'next';
import { dbService } from 'src/service/db';

export const OpenAPIHeadersMiddleware = async (req: NextApiRequest) => {
  const userkey = (req.headers['x-user-key'] as string) || '';
  const userPluginToken = await dbService.getUserPluginToken();
  const userPluginData = userPluginToken?.[userkey] || null;
  const token = userPluginData ? userPluginData.token : '';
  return {
    'x-plugin-token': token,
  };
};
