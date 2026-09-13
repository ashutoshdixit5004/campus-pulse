import { NextResponse } from 'next/server';
import { createStudentAccount } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentName = body.name || body.full_name;
    const { student_id, email, course, branch, phone, password } = body;

    if (!studentName || !student_id || !email || !course || !password) {
      return NextResponse.json(
        { error: 'INVALID_FORM_DATA: Full Name, Student ID, Email, Course, and Password are required.' },
        { status: 400 }
      );
    }

    const fixedCollege = 'SHEAT College of Engineering';
    const cleanBranch = branch?.trim() || 'B.Tech CSE - Babatpur';

    const student = await createStudentAccount({
      name: studentName,
      full_name: studentName,
      student_id,
      email,
      course,
      college: fixedCollege,
      branch: cleanBranch,
      phone: phone || '',
      password,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Student account registered successfully',
      student, // password already omitted
    }, { status: 201 });

    response.cookies.set('campuspulse_student_session', student.student_id, {
      path: '/',
      sameSite: 'lax',
      maxAge: 604800, // 7 days
    });

    return response;
  } catch (err: any) {
    const isDuplicate = err.message?.includes('DUPLICATE_STUDENT');
    return NextResponse.json(
      { error: err.message || 'Registration failed' },
      { status: isDuplicate ? 409 : 400 }
    );
  }
}
