import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin logged out successfully',
  });

  response.cookies.set('campuspulse_admin_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
