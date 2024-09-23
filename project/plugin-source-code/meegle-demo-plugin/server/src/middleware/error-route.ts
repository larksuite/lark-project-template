import { AxiosError } from 'axios';
import type { NextApiResponse } from 'next';

export const errorMiddleware = async (res: NextApiResponse, callback: Function) => {
  try {
    await callback();
  } catch (error) {
    if (error instanceof AxiosError) {
      const { response } = error;
      if (response) {
        const { status, data, config } = response;
        console.log(status, data, config.url);
        res.status(status).json(data);
      }
      return;
    }
    console.log('[errorMiddleware]', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};
