'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAttendanceList, getEvents } from '@/lib/db';
import { EventItem, RegistrationItem } from '@/types/database';
import { useToast } from '@/components/ToastProvider';

export default function AdminAttendancePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [allVerified, setAllVerified] = useState<RegistrationItem[]>([]);
  const [attendance, setAttendance] = useState<RegistrationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    getEvents().then((evs) => setEvents(evs));
  }, []);

  const loadData = async () => {
    const fullList = await getAttendanceList('ALL', undefined, selectedEventId || undefined);
    setAllVerified(fullList);
    const filteredList = await getAttendanceList(activeFilter, searchQuery, selectedEventId || undefined);
    setAttendance(filteredList);
  };

  useEffect(() => {
    loadData();
  }, [activeFilter, searchQuery, selectedEventId]);

  const verifiedTotal = allVerified.length;
  const checkedInTotal = allVerified.filter((r) => r.checked_in).length;
  const notCheckedInTotal = Math.max(0, verifiedTotal - checkedInTotal);
  const attendanceRate = verifiedTotal > 0 ? ((checkedInTotal / verifiedTotal) * 100).toFixed(2) : '0.00';

  const handleExportCSV = () => {
    let csv = 'Student Name,Student ID,Course,Email,Event,Pass ID,Check-in Time,Gate,Status\n';
    attendance.forEach((r) => {
      csv += `"${r.name}","${r.student_id}","${r.course}","${r.email}","${r.event_name || ''}","${r.pass_token || ''}","${r.checkin_time || ''}","${r.gate || ''}","${r.checked_in ? 'CHECKED_IN' : 'NOT_CHECKED_IN'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campus_pulse_attendance_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ Attendance Roster CSV exported successfully.');
  };

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
            REAL-TIME ROSTER TELEMETRY
          </div>
          <h1 style={{ fontSize: '36px' }}>Attendance & Check-in Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Live attendance verification, turnout percentage, and CSV roster export.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/scanner" className="btn btn-secondary">
            <i className="fa-solid fa-qrcode"></i> Turnstile Scanner
          </Link>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <i className="fa-solid fa-file-csv"></i> EXPORT CSV ROSTER
          </button>
        </div>
      </div>

      {/* Turnout Summary Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Verified Registrations</div>
          <div className="stat-value" id="attVerifiedTotal">
            {verifiedTotal}
          </div>
          <div className="stat-sub">100% Eligible for Entry</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: 'var(--accent-emerald)' }}>
            Checked In (Present)
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }} id="attCheckedInTotal">
            {checkedInTotal}
          </div>
          <div className="stat-sub">Confirmed on premises</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: '#fbbf24' }}>
            Not Checked In
          </div>
          <div className="stat-value" style={{ color: '#fbbf24' }} id="attNotCheckedInTotal">
            {notCheckedInTotal}
          </div>
          <div className="stat-sub">Pass issued, awaiting arrival</div>
        </div>

        <div className="stat-card">
          <div className="stat-label" style={{ color: 'var(--accent-cyan)' }}>
            Attendance Rate
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }} id="attPercentageTotal">
            {attendanceRate}%
          </div>
          <div className="stat-sub">Target: 75% Turnout</div>
        </div>
      </div>

      {/* Visual Turnout Progress Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span className="mono-tag" style={{ color: 'var(--accent-orange)' }}>
            <i className="fa-solid fa-chart-pie" style={{ marginRight: '6px' }}></i> TURNOUT PROGRESSION
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
            {checkedInTotal} of {verifiedTotal} Checked In ({attendanceRate}%)
          </span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, Number(attendanceRate)))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-orange), var(--accent-emerald))',
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Live Attendance Roster Table */}
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
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }} id="attendanceFilterBtns">
            {/* Event Dropdown Filter */}
            <select
              id="attendanceEventFilter"
              className="form-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ background: '#181b24', fontSize: '12px', minWidth: '180px' }}
            >
              <option value="">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>

            {/* Status Quick Filters */}
            <button
              className={`btn btn-secondary btn-sm ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              ALL ({verifiedTotal})
            </button>
            <button
              className={`btn btn-secondary btn-sm ${activeFilter === 'CHECKED_IN' ? 'active' : ''}`}
              onClick={() => setActiveFilter('CHECKED_IN')}
            >
              CHECKED IN ({checkedInTotal})
            </button>
            <button
              className={`btn btn-secondary btn-sm ${activeFilter === 'NOT_CHECKED_IN' ? 'active' : ''}`}
              onClick={() => setActiveFilter('NOT_CHECKED_IN')}
            >
              NOT CHECKED IN ({notCheckedInTotal})
            </button>
          </div>

          <div>
            <input
              type="text"
              id="attendanceSearchInput"
              className="form-input"
              placeholder="Search attendee, student ID, pass ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '280px', padding: '0.45rem 0.75rem', fontSize: '13px' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="pulse-table" id="attendanceTable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Event</th>
                <th>Course</th>
                <th>Pass ID</th>
                <th>Check-in Time</th>
                <th>Gate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="attendanceTableBody">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-user-xmark" style={{ fontSize: '32px', marginBottom: '0.75rem', opacity: 0.5, display: 'block' }}></i>
                    <div>No attendees match the selected event, filter, or search query.</div>
                  </td>
                </tr>
              ) : (
                attendance.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{item.student_id}</td>
                    <td style={{ fontSize: '12px', color: 'var(--accent-orange)' }}>
                      {item.event_name || 'Event'}
                    </td>
                    <td>{item.course}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {item.pass_token || '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {item.checkin_time || '—'}
                    </td>
                    <td>{item.gate || '—'}</td>
                    <td>
                      {item.checked_in ? (
                        <span className="badge badge-verified">
                          <i className="fa-solid fa-check"></i> CHECKED IN
                        </span>
                      ) : (
                        <span className="badge badge-pending">NOT CHECKED IN</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
