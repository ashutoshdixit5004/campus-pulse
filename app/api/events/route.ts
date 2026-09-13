import { NextResponse } from 'next/server';
import { getEvents, createEvent, deleteEvent, getEventBySlug } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || searchParams.get('id');
    if (slug) {
      const event = await getEventBySlug(slug);
      if (!event) {
        return NextResponse.json({ error: 'EVENT_NOT_FOUND: The requested event could not be found.' }, { status: 404 });
      }
      return NextResponse.json(event);
    }
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch events' }, { status: 500 });
  }
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      try {
        const body = await request.json();
        id = body.id || body.eventId;
        if (body.permanent !== undefined) permanent = Boolean(body.permanent);
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing event id for deletion' }, { status: 400 });
    }

    const success = await deleteEvent(id, permanent);
    if (!success) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: permanent ? 'Event permanently deleted' : 'Event safely archived/deactivated', 
      id 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete event' }, { status: 500 });
  }
}
