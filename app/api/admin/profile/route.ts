import { NextResponse } from 'next/server';
import { getAdminProfile, updateAdminProfile } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminCookie = cookieHeader.includes('campuspulse_admin_session=');

    if (!hasAdminCookie) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED: Admin session required' },
        { status: 401 }
      );
    }

    const profile = await getAdminProfile();
    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch admin profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminCookie = cookieHeader.includes('campuspulse_admin_session=');

    if (!hasAdminCookie) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED: Admin session required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const title = (body.title || '').trim();
    const phone = (body.phone || '').trim();
    const department = (body.department || '').trim();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'INVALID_DATA: Name and Email are required fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'INVALID_EMAIL: Please provide a valid institutional email' },
        { status: 400 }
      );
    }

    const updated = await updateAdminProfile({
      name,
      email,
      title: title || 'Dean of Student Affairs // Head of Events',
      phone,
      department,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin profile updated successfully',
      profile: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update admin profile' },
      { status: 500 }
    );
  }
}
