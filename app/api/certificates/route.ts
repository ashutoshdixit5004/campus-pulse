import { NextResponse } from 'next/server';
import { getCertificates, issueCertificatesForEvent, issueCertificateForParticipant } from '@/lib/db';

export async function GET() {
  try {
    const certs = await getCertificates();
    return NextResponse.json(certs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = body.eventId || body.event_id;
    const registrationId = body.registrationId || body.registration_id;

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // Individual participant certificate issuance
    if (registrationId) {
      const cert = await issueCertificateForParticipant({
        registrationId,
        eventId,
        role: body.role,
        marks: body.marks,
        result: body.result,
      });
      return NextResponse.json({ success: true, certificate: cert, issued: 1, eventId, registrationId });
    }

    // Batch event issuance
    const issuedCount = await issueCertificatesForEvent(eventId);
    return NextResponse.json({ success: true, issued: issuedCount, issued_count: issuedCount, eventId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

