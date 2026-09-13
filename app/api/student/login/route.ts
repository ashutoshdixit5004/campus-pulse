import { NextResponse } from 'next/server';
import { verifyStudentLogin } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || body.email || body.student_id || '').trim();
    const password = (body.password || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS: Student ID / Email and password are required.' },
        { status: 400 }
      );
    }

    const student = await verifyStudentLogin(identifier, password);

    if (!student) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS: Unknown credentials or invalid password. Please check your details.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Student authenticated successfully',
      student, // password excluded
    });

    response.cookies.set('campuspulse_student_session', student.student_id, {
      path: '/',
      sameSite: 'lax',
      maxAge: 604800, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
