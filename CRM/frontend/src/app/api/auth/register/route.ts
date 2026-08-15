import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, getCookieOptions, getDjangoApiUrl } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, email, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { non_field_errors: ['Username and password are required.'] },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { password: ['Password must be at least 8 characters.'] },
      { status: 400 }
    );
  }

  const res = await fetch(`${getDjangoApiUrl()}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email: email ?? '', password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, data.token, getCookieOptions());

  return NextResponse.json({ success: true });
}