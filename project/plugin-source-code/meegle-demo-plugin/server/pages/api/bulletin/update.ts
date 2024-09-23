import type { NextApiRequest, NextApiResponse } from 'next';
import { IUpdateBody } from '../../../src/service/type';
import { bulletinService } from '../../../src/service/bulletin';
import { AllowMethods } from '../../../src/types';
import { errorMiddleware } from 'src/middleware';
const allowMethod = AllowMethods.POST;
export default function (req: NextApiRequest, res: NextApiResponse) {
  const handler = async () => {
    const { body } = req;
    const result = await bulletinService.updateBulletin(body as IUpdateBody);
    res.json({
      success: result,
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
