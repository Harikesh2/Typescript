import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

const protectedPaths = ['/dashboard', '/records', '/reports'];
const authPaths = ['/login', '/register'];

function isProtected(path: string) {
  return protectedPaths.some((p) => path === p || path.startsWith(p + '/'));
}

function isAuthPath(path: string) {
  return authPaths.some((p) => path === p || path.startsWith(p + '/'));
}

export async function proxy(request: NextRequest) {
  const cookieStore = request.cookies;
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (isProtected(pathname) && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPath(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/records/:path*',
    '/reports/:path*',
    '/login',
    '/register',
  ],
};