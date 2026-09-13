import { NextResponse } from 'next/server';
import { getOrCreateStudentPass } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = (body.event_id || body.eventId || body.slug || '').trim();
    const studentId = (body.student_id || body.studentId || body.email || '').trim();
    const studentDetails = body.student || body.studentDetails || undefined;

    if (!eventId || !studentId) {
      return NextResponse.json(
        { error: 'MISSING_PARAMETERS: Both event_id and student_id are required.' },
        { status: 400 }
      );
    }

    const result = await getOrCreateStudentPass(eventId, studentId, studentDetails);

    return NextResponse.json({
      success: true,
      message: 'Pass retrieved / generated successfully',
      registration: result.registration,
      access_token: result.access_token,
      pass_token: result.pass_token,
      redirect_url: `/registration-status/${result.access_token}`,
    });
  } catch (err: any) {
    console.error('API /api/registrations/get-pass error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve or generate pass' },
      { status: 500 }
    );
  }
}
