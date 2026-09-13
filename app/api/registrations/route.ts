import { NextResponse } from 'next/server';
import { getRegistrations, createRegistration, getRegistrationByAccessToken } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || searchParams.get('accessToken') || searchParams.get('access_token') || searchParams.get('passToken');

  if (token) {
    const reg = await getRegistrationByAccessToken(token);
    if (!reg) {
      return NextResponse.json({ error: 'REGISTRATION_NOT_FOUND: Invalid or expired access token.' }, { status: 404 });
    }
    return NextResponse.json(reg);
  }

  const filter = (searchParams.get('filter') as any) || 'ALL';
  const eventId = searchParams.get('eventId') || undefined;
  const search = searchParams.get('search') || undefined;
  const studentId = searchParams.get('studentId') || searchParams.get('student_id') || undefined;

  const registrations = await getRegistrations(filter, eventId, search, studentId);
  return NextResponse.json(registrations);
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reg = await createRegistration(body);
    return NextResponse.json(reg, { status: 201 });
  } catch (err: any) {
    let status = 400;
    const msg = err?.message || '';
    if (msg.includes('DUPLICATE_REGISTRATION') || msg.includes('EVENT_CAPACITY_REACHED')) {
      status = 409;
    } else if (msg.includes('EVENT_NOT_FOUND')) {
      status = 404;
    }
    return NextResponse.json({ error: msg }, { status });
  }
}

