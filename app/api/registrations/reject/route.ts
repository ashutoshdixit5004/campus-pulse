import { NextResponse } from 'next/server';
import { rejectRegistration } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const registrationId = body.registrationId || body.registration_id;
    const reason = body.reason || body.rejection_reason;
    if (!registrationId || !reason) {
      return NextResponse.json({ error: 'Missing registrationId or reason' }, { status: 400 });
    }
    const updated = await rejectRegistration(registrationId, reason);
    if (!updated) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
