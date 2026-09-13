import { NextResponse } from 'next/server';
import { getEvaluations, saveEvaluation } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId') || searchParams.get('event_id');

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });
  }

  try {
    const evals = await getEvaluations(eventId);
    return NextResponse.json(evals);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { event_id, registration_id, student_id, student_name, course, marks, feedback, result, certificate_eligible } = body;

    if (!event_id || !registration_id) {
      return NextResponse.json(
        { error: 'Missing required parameters (event_id, registration_id)' },
        { status: 400 }
      );
    }

    if (!student_id) {
      const { getRegistrations } = await import('@/lib/db');
      const allRegs = await getRegistrations('ALL');
      const targetReg = allRegs.find(r => r.id === registration_id);
      if (targetReg) {
        student_id = targetReg.student_id;
        student_name = student_name || targetReg.name;
        course = course || targetReg.course;
      }
    }

    if (!student_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: student_id' },
        { status: 400 }
      );
    }

    const saved = await saveEvaluation({
      event_id,
      registration_id,
      student_id,
      student_name,
      course,
      marks: marks !== undefined && marks !== null && marks !== '' ? Number(marks) : null,
      feedback: feedback !== undefined ? String(feedback) : null,
      result: result || 'PARTICIPANT',
      certificate_eligible: Boolean(certificate_eligible),
    });

    return NextResponse.json({ success: true, evaluation: saved, ...saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save evaluation' }, { status: 500 });
  }
}
