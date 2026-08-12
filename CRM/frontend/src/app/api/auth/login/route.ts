import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, getCookieOptions, getDjangoApiUrl } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { non_field_errors: ['Username and password are required.'] },
      { status: 400 }
    );
  }

  const res = await fetch(`${getDjangoApiUrl()}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, data.token, getCookieOptions());

  return NextResponse.json({ success: true });
}