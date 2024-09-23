import type { NextApiRequest, NextApiResponse } from 'next';
import { request } from '../../../../src/utils';
import { AllowMethods } from '../../../../src/types';
import { OpenAPIHeadersMiddleware, errorMiddleware } from 'src/middleware';
function convertToTitleCase(str) {
  return str.replace(/\b\w/g, match => match.toUpperCase());
}

const allowMethod = AllowMethods.POST;
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const handler = async () => {
    const { project_key, work_item_type_key, work_item_id } = req.query;
    const { body } = req;
    const headers = await OpenAPIHeadersMiddleware(req);
    const response = await request({
      method: allowMethod,
      data: body,
      url: `/${project_key}/work_item/${work_item_type_key}/${work_item_id}/file/download`,
      responseType: 'arraybuffer',
      headers,
    });
    Object.entries(response.headers).forEach(([key, value]) => {
      const transFormKey = ['content-type', 'content-disposition'];
      if (transFormKey.includes(key)) {
        res.setHeader(convertToTitleCase(key), value);
      } else {
        res.setHeader(key, value);
      }
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    });
    const { status, data } = response;
    res.status(status).end(data);
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
