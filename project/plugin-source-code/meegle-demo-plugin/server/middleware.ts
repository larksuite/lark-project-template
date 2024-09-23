import { NextRequest, NextResponse } from 'next/server';
import { jwtVerifyAsync } from 'src/utils/jwt';
const AUTH_PATH = '/api/authen';
const generateHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
});
const generateResponse =
  (headers: Record<string, string>) =>
  (status: number = 200, msg: string = '请求成功') =>
    NextResponse.json(
      {
        msg,
      },
      {
        headers,
        status,
      },
    );
export async function middleware(request: NextRequest) {
  const { method } = request;
  const baseHeaders = generateHeaders();
  const nextResponseBody = generateResponse(baseHeaders);
  if (method === 'OPTIONS') {
    return nextResponseBody();
  }
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(baseHeaders)) {
    response.headers.set(key, value);
  }
  const { pathname } = request.nextUrl;
  if (!pathname.includes(AUTH_PATH)) {
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return nextResponseBody(401, 'Authentication failed');
    }
    try {
      const { payload }: { payload: Object } = await jwtVerifyAsync(authorization);
      if (Object.prototype.hasOwnProperty.call(payload, 'user_key')) {
        response.headers.set('x-user-key', payload['user_key']);
      }
      return response;
    } catch (error) {
      console.log(error);
      return nextResponseBody(401, 'Authentication Verify failed');
    }
  }
  return response;
}
