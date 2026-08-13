import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, getDjangoApiUrl } from '@/lib/auth';

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  await params;
  const path = request.nextUrl.pathname.replace(/^\/api\//, '');
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const url = `${getDjangoApiUrl()}/api/${path}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cookie');

  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const res = await fetch(url, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
  });

  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete('set-cookie');

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;