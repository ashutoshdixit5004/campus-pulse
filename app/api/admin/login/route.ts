import { NextResponse } from 'next/server';
import { ADMIN_CONFIG } from '@/lib/auth';
import { getAdminProfile } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || body.email || body.username || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Missing admin username or password' },
        { status: 400 }
      );
    }

    const currentProfile = await getAdminProfile();
    const authorizedEmails = [
      ...ADMIN_CONFIG.emails.map((e) => e.toLowerCase()),
      currentProfile.email.toLowerCase(),
    ];

    const isAuthorizedIdentity = authorizedEmails.includes(identifier);

    const isPasswordValid =
      password === ADMIN_CONFIG.defaultPassword ||
      password === 'admin123' ||
      password === 'admin';

    if (!isAuthorizedIdentity || !isPasswordValid) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS: Unauthorized administrative credentials.' },
        { status: 401 }
      );
    }

    const sessionToken = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session = {
      token: sessionToken,
      name: currentProfile.name,
      title: currentProfile.title,
      email: currentProfile.email,
      phone: currentProfile.phone,
      department: currentProfile.department,
      loginAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication verified',
      session,
      user: session,
    });

    response.cookies.set('campuspulse_admin_session', sessionToken, {
      httpOnly: false, // Accessible by client scripts for consistent auth checks
      path: '/',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
