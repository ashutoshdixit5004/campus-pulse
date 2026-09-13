import { NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/lib/db';

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await createEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
