'use client';

import React, { useEffect, useState } from 'react';
import QRScannerComponent from '@/components/QRScannerComponent';
import { getEvents, getRecentCheckins, getAttendanceList, ScanValidationResult } from '@/lib/db';
import { EventItem, RegistrationItem } from '@/types/database';

export default function AdminScannerPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState('');
  const [selectedGate, setSelectedGate] = useState('Gate 01 - Main Entrance');
  const [recentCheckins, setRecentCheckins] = useState<RegistrationItem[]>([]);
  const [totalCheckedIn, setTotalCheckedIn] = useState<number>(0);

  const loadCheckinData = async (eventSlug?: string) => {
    const targetSlug = eventSlug || selectedEventSlug;
    const list = await getRecentCheckins(8);
    setRecentCheckins(list);
    const allChecked = await getAttendanceList('CHECKED_IN', undefined, targetSlug);
    setTotalCheckedIn(allChecked.length);
  };

  useEffect(() => {
    getEvents().then((evs) => {
      setEvents(evs);
      if (evs.length > 0 && !evs.some(e => e.slug === selectedEventSlug)) {
        setSelectedEventSlug(evs[0].slug);
      }
    });
    loadCheckinData();
  }, []);

  const handleEventChange = (newSlug: string) => {
    setSelectedEventSlug(newSlug);
    loadCheckinData(newSlug);
  };

  const handleCheckinSuccess = (_result: ScanValidationResult) => {
    loadCheckinData();
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
            VENUE ACCESS // TURNSTILE GATE VALIDATOR
          </div>
          <h1 style={{ fontSize: '36px' }}>Entrance QR Scanner Station</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time camera scanning, credential validation, pass duplicate prevention, and check-in logging.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            id="scannerEventSelect"
            className="form-select"
            value={selectedEventSlug}
            onChange={(e) => handleEventChange(e.target.value)}
            style={{ background: '#181b24', minWidth: '220px' }}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.slug}>
                {ev.name}
              </option>
            ))}
          </select>

          <select
            id="scannerGateSelect"
            className="form-select"
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            style={{ background: '#181b24' }}
          >
            <option value="Gate 02 - Main Atrium">Gate 02 - Main Atrium Entrance</option>
            <option value="Gate 01 - North Wing">Gate 01 - North Wing</option>
            <option value="Gate 03 - Innovation Hub">Gate 03 - Innovation Hub</option>
          </select>
        </div>
      </div>

      <QRScannerComponent
        selectedEventId={selectedEventSlug}
        selectedGate={selectedGate}
        onCheckinSuccess={handleCheckinSuccess}
      />

      {/* Recent Turnstile Check-ins Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ fontSize: '15px', textTransform: 'uppercase' }} className="font-mono">
            RECENT TURNSTILE CHECK-INS
          </h3>
          <span className="badge badge-verified" id="scannerLiveCount">
            {totalCheckedIn} CHECKED IN
          </span>
        </div>

        <div className="table-container">
          <table className="pulse-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Pass ID</th>
                <th>Gate</th>
                <th>Check-in Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCheckins.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No turnstile check-ins recorded yet for this session. Use the scanner above to validate attendee credentials.
                  </td>
                </tr>
              ) : (
                recentCheckins.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{item.student_id}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {item.pass_token}
                    </td>
                    <td>{item.gate || 'Gate 02'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.checkin_time || '09:14 AM'}</td>
                    <td>
                      <span className="badge badge-verified">CHECKED IN</span>
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
