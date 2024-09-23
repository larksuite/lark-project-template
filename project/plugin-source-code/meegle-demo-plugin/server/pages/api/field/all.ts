import type { NextApiRequest, NextApiResponse } from 'next';
import { request } from '../../../src/utils';
import { AllowMethods } from '../../../src/types';
import { OpenAPIHeadersMiddleware, errorMiddleware } from 'src/middleware';

const allowMethod = AllowMethods.POST;
export default function (req: NextApiRequest, res: NextApiResponse) {
  const handler = async () => {
    const { project_key } = req.query;
    const { body } = req;
    const headers = await OpenAPIHeadersMiddleware(req);
    const response = await request({
      method: allowMethod,
      data: body,
      url: `/${project_key}/field/all`,
      headers,
    });
    const { status, data: axiosResponse } = response;
    res.status(status).json(axiosResponse);
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
