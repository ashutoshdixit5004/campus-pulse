import { NextResponse } from 'next/server';
import { getAdminProfile } from '@/lib/db';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const hasAdminCookie = cookieHeader.includes('campuspulse_admin_session=');

  if (!hasAdminCookie) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const profile = await getAdminProfile();

  return NextResponse.json({
    authenticated: true,
    admin: profile,
  });
}
