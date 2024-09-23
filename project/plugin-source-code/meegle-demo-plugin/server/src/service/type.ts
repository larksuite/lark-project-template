export interface IBulletinItem {
  project_key: string;
  default_url?: string;
  url?: string;
}
export interface IDbBulletinSource {
  list: IBulletinItem[];
}

export interface IUpdateBody {
  project_key: string;
  url: string;
  mode: string | undefined;
}
