import { NextResponse } from 'next/server';
import { getStudentByEmailOrId } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let identifier = searchParams.get('identifier');

  if (!identifier) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/campuspulse_student_session=([^;]+)/);
    if (match) {
      identifier = decodeURIComponent(match[1]);
    }
  }

  if (!identifier) {
    return NextResponse.json({ authenticated: false, student: null });
  }

  const student = await getStudentByEmailOrId(identifier);

  if (!student) {
    return NextResponse.json({ authenticated: false, student: null });
  }

  return NextResponse.json({
    authenticated: true,
    student, // password already excluded by getStudentByEmailOrId
  });
}
