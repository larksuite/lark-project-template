import * as jose from 'jose';

const projectSecret = new TextEncoder().encode('openapp_plugin_demo_server_example');
const alg = 'HS256';
export const jwtSignAsync = async (data: any) =>
  new jose.SignJWT(data)
    .setProtectedHeader({
      alg,
    })
    .sign(projectSecret);
export const jwtVerifyAsync = async (jwt: any) => jose.jwtVerify(jwt, projectSecret);
