import { NextResponse } from 'next/server';
import { verifyRegistration } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const registrationId = body.registrationId || body.registration_id;
    if (!registrationId) {
      return NextResponse.json({ error: 'Missing registrationId' }, { status: 400 });
    }
    const updated = await verifyRegistration(registrationId);
    if (!updated) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
