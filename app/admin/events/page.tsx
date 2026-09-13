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
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [permanentDelete, setPermanentDelete] = useState(false);
  const { showToast } = useToast();

  const loadEvents = async () => {
    setLoading(true);
    const evs = await getEvents();
    setEvents(evs);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
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

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/events?id=${encodeURIComponent(eventToDelete.id)}&permanent=${permanentDelete}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete event');
      }

      showToast(`✓ Event "${eventToDelete.name}" ${permanentDelete ? 'permanently deleted' : 'safely archived'}.`);
      setEventToDelete(null);
      await loadEvents();
    } catch (err: any) {
      showToast(err.message || 'Error deleting event', 'error');
    } finally {
      setIsDeleting(false);
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
                          {/* 1. VIEW: Opens /admin/events/[id] */}
                          <Link
                            href={`/admin/events/${ev.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Operational Control Center"
                          >
                            <i className="fa-solid fa-eye"></i> View
                          </Link>

                          {/* 2. EDIT: Opens /admin/events/[id] Control Center */}
                          <Link
                            href={`/admin/events/${ev.id}`}
                            className="btn btn-primary btn-sm"
                            title="Manage & Edit Event Specifications"
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </Link>

                          {/* 3. DELETE: Safe deletion modal */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--accent-red)' }}
                            onClick={() => setEventToDelete(ev)}
                            title="Delete / Archive Event"
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>

                          {/* Quick Link Helper */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCopyLink(ev.slug)}
                            title="Copy Public Registration Link"
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

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="modal-overlay active" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: '520px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 59, 48, 0.15)',
                  border: '1px solid var(--accent-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-red)',
                  fontSize: '18px',
                }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Confirm Event Deletion</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Event: {eventToDelete.name}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                background: '#12141c',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: '#fff' }}>Warning:</strong> Removing this event will remove it from public discoverability and active registrations.
              <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                Associated registrations, entry passes, attendance records, certificates, and evaluation marks will be safely handled according to institutional data policies.
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={permanentDelete}
                  onChange={(e) => setPermanentDelete(e.target.checked)}
                />
                <span>Permanently purge event and cascade delete all dependent records</span>
              </label>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '22px', marginTop: '3px' }}>
                Unchecked: Safely archives the event so historical attendance and issued certificates remain preserved.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash-can"></i> Confirm Deletion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

