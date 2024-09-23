export interface IUserPluginToken {
  expire_time: number;
  refresh_token: string;
  refresh_token_expire_time: number;
  sass_tenant_key: string;
  token: string;
  user_key: string;
}
export interface IPluginToken {
  token: string;
  expire_time: number;
}
