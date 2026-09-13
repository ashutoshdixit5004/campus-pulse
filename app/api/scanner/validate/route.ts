import { NextResponse } from 'next/server';
import { validatePassToken } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const passToken = body.passToken || body.pass_token;
    const eventSlugOrId = body.eventSlugOrId || body.event_id || body.eventId;
    const gate = body.gate || 'Gate 02';

    if (!passToken) {
      return NextResponse.json({ error: 'Missing passToken' }, { status: 400 });
    }
    const result = await validatePassToken(passToken, eventSlugOrId, gate);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
