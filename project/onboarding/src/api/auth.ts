import { request } from '../utils';

export const loginAuth = async (code: string) =>
  request
    .post<{
      msg: string;
    }>(`/authen?code=${code}`)
    .then(res => res.data);
