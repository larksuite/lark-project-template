import type { NextApiRequest, NextApiResponse } from 'next';
import { bulletinService } from '../../../src/service/bulletin';
import { AllowMethods } from '../../../src/types';
import { errorMiddleware } from 'src/middleware';
const allowMethod = AllowMethods.GET;
export default function query(req: NextApiRequest, res: NextApiResponse) {
  const handler = async () => {
    const { mode, project_key } = req.query;
    if (typeof project_key !== 'string') {
      res.json({
        msg: 'Parameter not legal',
      });
      return;
    }
    const result = await bulletinService.queryBulletin(project_key);
    const url = mode === 'config' ? result?.default_url : result?.url || result?.default_url;

    res.status(200).json({
      data: url || '',
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
