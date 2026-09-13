'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents } from '@/lib/db';
import { EventItem } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/ToastProvider';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    getEvents().then((evs) => {
      setEvents(evs);
      setLoading(false);
    });
  }, []);

  const handleCopyLink = (slug: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/register/${slug}`;
      navigator.clipboard
        .writeText(url)
        .then(() => showToast(`✓ Copied registration link: ${url}`))
        .catch(() => showToast(`Link: ${url}`));
    }
  };

  const filteredEvents = events.filter((ev) =>
    ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="view-section active">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
            CAMPUS CONTROL // REGISTRY
          </div>
          <h1 style={{ fontSize: '38px' }}>Event Management Registry</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Inspect active and past events, monitor capacity, open QR scanners, and access event control centers.
          </p>
        </div>
        <div>
          <Link href="/admin/events/create" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> Create New Event
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search event, venue, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '280px', padding: '0.45rem 0.75rem', fontSize: '13px' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '26px', color: 'var(--accent-orange)' }}></i>
            <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              LOADING EVENTS REGISTRY...
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="pulse-table">
              <thead>
                <tr>
                  <th>Event Name & Category</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Capacity</th>
                  <th>Registrations</th>
                  <th>Verified</th>
                  <th>Check-ins</th>
                  <th>Reg Status</th>
                  <th>Event Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <Link href={`/admin/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                          <div className="table-title" style={{ color: '#fff', cursor: 'pointer' }}>
                            {ev.name}
                          </div>
                        </Link>
                        <div className="table-subtitle">{ev.category}</div>
                      </td>
                      <td>
                        <div>{ev.date}</div>
                        <div className="table-subtitle">{ev.start_time} - {ev.end_time}</div>
                      </td>
                      <td>{ev.venue}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{ev.capacity}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {ev.registered_count || 0}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                        {ev.verified_count || 0}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)' }}>
                        {ev.checkins_count || 0}
                      </td>
                      <td>
                        <StatusBadge status={ev.status} />
                      </td>
                      <td>
                        <StatusBadge status={ev.event_status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <Link
                            href={`/admin/events/${ev.id}`}
                            className="btn btn-primary btn-sm"
                            title="Event Control Center"
                          >
                            <i className="fa-solid fa-sliders"></i> MANAGE
                          </Link>
                          <Link
                            href={`/register/${ev.slug}`}
                            className="btn btn-secondary btn-sm"
                            title="Preview Public Link"
                          >
                            <i className="fa-solid fa-eye"></i> VIEW
                          </Link>
                          <Link
                            href="/admin/registrations"
                            className="btn btn-secondary btn-sm"
                            title="Manage Registrations"
                          >
                            <i className="fa-solid fa-users"></i> REGS
                          </Link>
                          <Link
                            href={`/admin/scanner?event=${ev.slug}`}
                            className="btn btn-secondary btn-sm"
                            title="Open QR Scanner"
                          >
                            <i className="fa-solid fa-qrcode"></i> SCAN
                          </Link>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCopyLink(ev.slug)}
                            title="Copy Registration Link"
                          >
                            <i className="fa-solid fa-link"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <div style={{ color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '32px', marginBottom: '0.75rem', opacity: 0.5 }}></i>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          No Events Found
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '4px', maxWidth: '400px', margin: '4px auto 1rem' }}>
                          {searchQuery ? `No active event records match "${searchQuery}".` : 'No events have been created yet.'}
                        </div>
                        <Link href="/admin/events/create" className="btn btn-primary btn-sm">
                          <i className="fa-solid fa-plus"></i> Create New Event
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
