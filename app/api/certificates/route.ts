import { NextResponse } from 'next/server';
import { getCertificates, issueCertificatesForEvent } from '@/lib/db';

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
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }
    const issuedCount = await issueCertificatesForEvent(eventId);
    return NextResponse.json({ issued: issuedCount, issued_count: issuedCount, eventId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
