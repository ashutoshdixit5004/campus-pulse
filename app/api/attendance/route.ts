import { NextResponse } from 'next/server';
import { getAttendanceList } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = (searchParams.get('filter') as any) || 'ALL';
  const search = searchParams.get('search') || undefined;
  const eventId = searchParams.get('eventId') || undefined;

  const list = await getAttendanceList(filter, search, eventId);
  return NextResponse.json(list);
}
