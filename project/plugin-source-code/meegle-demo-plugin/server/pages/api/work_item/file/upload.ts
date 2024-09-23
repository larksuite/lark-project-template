import type { NextApiRequest, NextApiResponse } from 'next';
import { FormData } from 'formdata-node';
import { fileFromPathSync } from 'formdata-node/file-from-path';
import formidable from 'formidable';
import { request } from '../../../../src/utils';
import { AllowMethods } from '../../../../src/types';
import { OpenAPIHeadersMiddleware, errorMiddleware } from 'src/middleware';

const allowMethod = AllowMethods.POST;
interface FormParse {
  fields: formidable.Fields<string>;
  files: formidable.Files<string>;
}
export const config = {
  api: {
    bodyParser: false, // 禁用默认的bodyParser
  },
};
const parseFormData = (req: NextApiRequest) => {
  const form = formidable({ multiples: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
    });
  });
};

const createFormData = ({ fields, files }: FormParse) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(files)) {
    value.forEach(item => {
      const newFile = fileFromPathSync(item.filepath, item.originalFilename, {
        type: item.mimetype,
      });
      formData.append(key, newFile);
    });
  }
  for (const [key, values] of Object.entries(fields)) {
    values.forEach(val => {
      formData.append(key, val);
    });
  }
  return formData;
};
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const handler = async () => {
    const { project_key, work_item_type_key, work_item_id } = req.query;
    const formParse = (await parseFormData(req)) as FormParse;
    const formData = createFormData(formParse);
    const headers = await OpenAPIHeadersMiddleware(req);
    const response = await request({
      method: allowMethod,
      data: formData,
      url: `/${project_key}/work_item/${work_item_type_key}/${work_item_id}/file/upload`,
      headers,
    });
    const { status, data } = response;
    res.status(status).json(data);
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
