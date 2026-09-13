'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/CertificateModal';
import { getRegistrations } from '@/lib/db';
import { RegistrationItem } from '@/types/database';

interface MyEventItem {
  id: string;
  name: string;
  date: string;
  venue: string;
  regStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  passStatus: 'READY' | 'LOCKED' | 'SCANNED';
  checkinStatus: 'READY FOR ENTRY' | 'UNCONFIRMED' | 'ATTENDED';
  tabType: string[];
  registration: RegistrationItem;
}

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [events, setEvents] = useState<MyEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [certModalData, setCertModalData] = useState<{
    isOpen: boolean;
    title: string;
    student: string;
    role: string;
    date: string;
  }>({
    isOpen: false,
    title: '',
    student: '',
    role: '',
    date: '',
  });

  useEffect(() => {
    getRegistrations('ALL').then((regs) => {
      const mapped: MyEventItem[] = regs.map((r) => {
        const isAttended = Boolean(r.checked_in);
        const isVerified = r.status === 'VERIFIED';
        const isPending = r.status === 'PENDING';
        const isRejected = r.status === 'REJECTED';

        const tabs: string[] = [];
        if (isVerified) tabs.push('VERIFIED');
        if (isPending) tabs.push('PENDING');
        if (isAttended) tabs.push('ATTENDED', 'COMPLETED');
        if (!isAttended) tabs.push('UPCOMING');

        return {
          id: r.id,
          name: r.event_name || 'Campus Event',
          date: r.events?.date ? `${r.events.date} • ${r.events.start_time || '09:00'}` : 'Oct 24, 2026 • 09:00 AM',
          venue: r.events?.venue || 'Campus Auditorium',
          regStatus: r.status,
          passStatus: isVerified ? (isAttended ? 'SCANNED' : 'READY') : 'LOCKED',
          checkinStatus: isAttended ? 'ATTENDED' : (isVerified ? 'READY FOR ENTRY' : 'UNCONFIRMED'),
          tabType: tabs,
          registration: r,
        };
      });

      setEvents(mapped);
      setLoading(false);
    });
  }, []);

  const filtered = activeTab === 'ALL'
    ? events
    : events.filter((e) => e.tabType.includes(activeTab));

  const tabs = ['ALL', 'PENDING', 'VERIFIED', 'UPCOMING', 'ATTENDED', 'COMPLETED'];

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          STUDENT TRACKER
        </div>
        <h1 style={{ fontSize: '36px' }}>My Registered Events</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Track your registration approvals, active passes, and verified attendance certificates in real time.
        </p>
      </div>

      {/* Lifecycle Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: 'var(--border-hairline)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => {
          const count =
            tab === 'ALL'
              ? events.length
              : events.filter((e) => e.tabType.includes(tab)).length;

          return (
            <button
              key={tab}
              className={`btn btn-secondary btn-sm ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? '#1f232e' : undefined,
                borderBottom: activeTab === tab ? '2px solid var(--accent-orange)' : undefined,
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Event Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filtered.map((ev) => {
          return (
            <div
              key={ev.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div className="mono-tag" style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>
                    CAMPUS EVENT
                  </div>
                  <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                    {ev.regStatus}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '0.25rem' }}>{ev.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <i className="fa-regular fa-calendar" style={{ marginRight: '4px' }}></i> {ev.date}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i> {ev.venue}
                </p>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: 'var(--border-hairline)',
                }}
              >
                {ev.regStatus === 'PENDING' ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-pending">
                        <i className="fa-solid fa-hourglass-half"></i> WAITING FOR VERIFICATION
                      </span>
                      {ev.registration.access_token && (
                        <Link
                          href={`/registration-status/${ev.registration.access_token}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px' }}
                        >
                          STATUS DOSSIER
                        </Link>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginTop: '6px',
                      }}
                    >
                      Coordinator auditing credentials & ID scan
                    </span>
                  </div>
                ) : ev.checkinStatus === 'ATTENDED' ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="badge badge-verified">
                      <i className="fa-solid fa-check"></i> ATTENDED
                    </span>
                    <button
                      className="btn btn-cyan btn-sm"
                      onClick={() =>
                        setCertModalData({
                          isOpen: true,
                          title: ev.name,
                          student: ev.registration.name,
                          role: 'Verified Attendee',
                          date: ev.date.split(' • ')[0],
                        })
                      }
                    >
                      <i className="fa-solid fa-award"></i> CERTIFICATE AVAILABLE
                    </button>
                    {ev.registration.access_token && (
                      <Link
                        href={`/registration-status/${ev.registration.access_token}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="fa-solid fa-ticket"></i> PASS
                      </Link>
                    )}
                  </div>
                ) : ev.regStatus === 'REJECTED' ? (
                  <div>
                    <span className="badge badge-rejected">
                      <i className="fa-solid fa-ban"></i> REGISTRATION REJECTED
                    </span>
                    {ev.registration.access_token && (
                      <Link
                        href={`/registration-status/${ev.registration.access_token}`}
                        className="btn btn-secondary btn-sm"
                        style={{ marginLeft: '8px', fontSize: '11px' }}
                      >
                        VIEW REASON
                      </Link>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link
                      href={ev.registration.access_token ? `/registration-status/${ev.registration.access_token}` : '/my-passes'}
                      className="btn btn-primary btn-sm"
                    >
                      <i className="fa-solid fa-ticket"></i> VIEW DIGITAL PASS
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', marginTop: '1rem' }}>
          <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '36px', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
          <h3 style={{ fontSize: '20px', marginBottom: '0.5rem' }}>No Registrations In This Category</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
            Explore available campus events to submit zero-login registration requests and generate your Digital Pass.
          </p>
          <Link href="/events" className="btn btn-primary">
            <i className="fa-solid fa-compass"></i> Discover Campus Events
          </Link>
        </div>
      )}

      <CertificateModal
        isOpen={certModalData.isOpen}
        onClose={() => setCertModalData((prev) => ({ ...prev, isOpen: false }))}
        eventTitle={certModalData.title}
        studentName={certModalData.student}
        role={certModalData.role}
        date={certModalData.date}
      />
    </section>
  );
}
