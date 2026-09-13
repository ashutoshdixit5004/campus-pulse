import { NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }
    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: 'EVENT_NOT_FOUND: The requested event could not be found.' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch event' }, { status: 500 });
  }
}
