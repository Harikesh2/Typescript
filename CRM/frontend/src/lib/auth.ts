export const COOKIE_NAME = 'dcrm_token';

export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function getDjangoApiUrl(): string {
  return process.env.DJANGO_API_URL ?? 'http://localhost:8000';
}