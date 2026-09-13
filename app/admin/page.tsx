'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents, getDashboardStats } from '@/lib/db';
import { EventItem, DashboardStats } from '@/types/database';
import { isSupabaseConfigured } from '@/lib/supabase';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/ToastProvider';

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([getEvents(), getDashboardStats()]).then(([evs, st]) => {
      setEvents(evs);
      setStats(st);
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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
            CAMPUS CONTROL // REAL-TIME OPS
          </div>
          <h1 style={{ fontSize: '38px' }}>College Event Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Real-time management for college events, zero-login registrations, turnstile QR scanning, and accredited certificates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/scanner" className="btn btn-secondary">
            <i className="fa-solid fa-camera"></i> Launch Scanner
          </Link>
          <Link href="/admin/events/create" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> Create Event
          </Link>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div className="mono-tag" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-bolt" style={{ color: 'var(--accent-orange)' }}></i>
          QUICK ACTIONS
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/admin/events/create" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus"></i> CREATE EVENT
          </Link>
          <Link href="/admin/events" className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-calendar-days"></i> VIEW EVENTS
          </Link>
          <Link href="/admin/verification" className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-user-check"></i> VERIFY REGISTRATIONS
            {stats && stats.pendingVerifications > 0 && (
              <span
                style={{
                  marginLeft: '6px',
                  background: 'var(--accent-amber)',
                  color: '#000',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {stats.pendingVerifications}
              </span>
            )}
          </Link>
          <Link href="/admin/scanner" className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-qrcode"></i> OPEN SCANNER
          </Link>
          <Link href="/admin/attendance" className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-chart-pie"></i> VIEW ATTENDANCE
          </Link>
          <Link href="/admin/certificates" className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-award"></i> CERTIFICATES
          </Link>
        </div>
      </div>

      {/* Top Statistics Counters */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">
            EVENTS <i className="fa-solid fa-calendar-days"></i>
          </div>
          <div className="stat-value">{stats ? stats.totalEvents : '—'}</div>
          <div className="stat-sub">
            {events.filter((e) => e.status === 'OPEN').length} Open &bull; {events.filter((e) => e.status === 'CLOSED').length} Closed
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            REGISTRATIONS <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
            {stats ? stats.totalRegistrations.toLocaleString() : '—'}
          </div>
          <div className="stat-sub">Public submissions received</div>
        </div>

        <div className={`stat-card ${stats && stats.pendingVerifications > 0 ? 'alert-card' : ''}`}>
          <div className="stat-label" style={{ color: '#fbbf24' }}>
            VERIFICATION <i className="fa-solid fa-hourglass-half"></i>
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {stats ? stats.pendingVerifications : '—'}
          </div>
          <div className="stat-sub">
            {stats ? `${stats.verifiedStudents} verified passes issued` : 'Audited applicants'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: 'var(--accent-emerald)' }}>
            ATTENDANCE <i className="fa-solid fa-door-open"></i>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
            {stats ? stats.todayCheckins : '—'}
          </div>
          <div className="stat-sub">
            {stats ? `${stats.attendanceRate}% turnout rate` : 'Turnstile scans'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: 'var(--accent-cyan)' }}>
            CERTIFICATES <i className="fa-solid fa-award"></i>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
            {stats ? stats.certificatesIssued : '—'}
          </div>
          <div className="stat-sub">Accredited to attendees</div>
        </div>
      </div>

      {/* SYSTEM STATUS Area */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div className="mono-tag" style={{ color: 'var(--accent-cyan)' }}>
            <i className="fa-solid fa-server" style={{ marginRight: '6px' }}></i> SYSTEM STATUS // VERIFIED PROTOCOLS
          </div>
          <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
            TELEMETRY REFRESH: REALTIME
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: 'var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>DATABASE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span className="pulse-dot" style={{ background: isSupabaseConfigured ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}></span>
              <span>{isSupabaseConfigured ? 'Supabase Cloud (PostgreSQL)' : 'Campus Pulse Store (Active)'}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isSupabaseConfigured ? 'Direct cloud database sync' : 'In-memory relational persistence'}
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: 'var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>QR SYSTEM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span className="pulse-dot" style={{ background: 'var(--accent-emerald)' }}></span>
              <span>Turnstile Token Engine</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Unique pass token generation & optical scanning
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: 'var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>REGISTRATION SYSTEM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span className="pulse-dot" style={{ background: 'var(--accent-emerald)' }}></span>
              <span>Guard Protocol Online</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Capacity, deadline & duplicate guards active
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: 'var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>ATTENDANCE SYSTEM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span className="pulse-dot" style={{ background: 'var(--accent-emerald)' }}></span>
              <span>Single-Entry Check-in Sync</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Realtime turnstile lock & duplicate rejection
            </div>
          </div>
        </div>
      </div>

      {/* Event Management Hub Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px' }}>EVENT MANAGEMENT REGISTRY</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Manage event lifecycles, inspect capacity, trigger QR scanners, and access dedicated event control centers.
            </p>
          </div>
          <div>
            <input
              type="text"
              className="form-input"
              placeholder="Search event, venue, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '280px', padding: '0.45rem 0.75rem', fontSize: '13px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '26px', color: 'var(--accent-orange)' }}></i>
            <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              SYNCHRONIZING EVENT REGISTRY...
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
                            title="Open Event Control Center"
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
                          No Events Matching Filter
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '4px', maxWidth: '400px', margin: '4px auto 1rem' }}>
                          {searchQuery ? `No active event records match "${searchQuery}".` : 'No events have been created in the registry yet.'}
                        </div>
                        <Link href="/admin/events/create" className="btn btn-primary btn-sm">
                          <i className="fa-solid fa-plus"></i> Create First Event
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
