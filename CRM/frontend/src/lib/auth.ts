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
  const url = process.env.DJANGO_API_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DJANGO_API_URL is required in production');
    }
    return 'http://localhost:8000';
  }
  return url;
}