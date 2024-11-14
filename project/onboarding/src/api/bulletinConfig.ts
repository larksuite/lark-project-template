import { request } from '../utils';

export interface IBulletinReq {
  project_key: string;
  url: string;
  mode?: string;
}
export const queryBulletin = (project_key: IBulletinReq['project_key'], mode?: string) =>
  request
    .get<{
      data: string;
    }>('/bulletin/query', {
      params: {
        project_key,
        mode,
      },
    })
    .then(res => res.data);
export const updateBulletin = (data: IBulletinReq) =>
  request
    .post<{
      success: boolean;
    }>('/bulletin/update', data)
    .then(res => res.data);
