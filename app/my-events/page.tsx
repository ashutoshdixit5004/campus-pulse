'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/CertificateModal';
import { getRegistrations } from '@/lib/db';
import { getStudentSession, setStudentSession } from '@/lib/auth';
import { RegistrationItem, StudentAccount } from '@/types/database';

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
  const [currentStudent, setCurrentStudent] = useState<StudentAccount | null>(null);
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

  const loadData = async () => {
    setLoading(true);
    const student = getStudentSession();
    setCurrentStudent(student);

    const studentIdFilter = student?.student_id;
    const regs = await getRegistrations('ALL', undefined, studentIdFilter);

    // Filter strictly to current student if authenticated
    const studentRegs = student
      ? regs.filter(
          (r) =>
            r.student_id === student.student_id ||
            (student.email && r.email?.toLowerCase() === student.email.toLowerCase())
        )
      : regs;

    const mapped: MyEventItem[] = studentRegs.map((r) => {
      const isAttended = Boolean(r.checked_in);
      const isVerified = r.status === 'VERIFIED';
      const isPending = r.status === 'PENDING';

      const tabs: string[] = [];
      if (isVerified) tabs.push('VERIFIED');
      if (isPending) tabs.push('PENDING');
      if (isAttended) tabs.push('ATTENDED', 'COMPLETED');
      if (!isAttended) tabs.push('UPCOMING');
      if (r.result && r.result !== 'PARTICIPANT' && r.result !== 'NOT ELIGIBLE') {
        tabs.push('AWARDS');
      }

      return {
        id: r.id,
        name: r.event_name || 'Campus Event',
        date: r.events?.date ? `${r.events.date} • ${r.events.start_time || '09:00'}` : 'Oct 24, 2026 • 09:00 AM',
        venue: r.events?.venue || 'Campus Auditorium',
        regStatus: r.status,
        passStatus: isVerified ? (isAttended ? 'SCANNED' : 'READY') : 'LOCKED',
        checkinStatus: isAttended ? 'ATTENDED' : isVerified ? 'READY FOR ENTRY' : 'UNCONFIRMED',
        tabType: tabs,
        registration: r,
      };
    });

    setEvents(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = activeTab === 'ALL'
    ? events
    : events.filter((e) => e.tabType.includes(activeTab));

  const tabs = ['ALL', 'PENDING', 'VERIFIED', 'UPCOMING', 'ATTENDED', 'AWARDS', 'COMPLETED'];

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          STUDENT TRACKER // ISOLATED DOSSIER
        </div>
        <h1 style={{ fontSize: '36px' }}>My Registered Events</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Track your personal registration approvals, active passes, and declared competition results in real time.
        </p>
      </div>

      {/* Student Session Header */}
      {currentStudent ? (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(0, 240, 255, 0.04)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                fontSize: '14px',
              }}
            >
              {(currentStudent.name || currentStudent.full_name || 'S').charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>
                {currentStudent.name || currentStudent.full_name}{' '}
                <span className="mono-tag" style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>
                  {currentStudent.student_id}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {currentStudent.course} &bull; {currentStudent.college}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/profile" className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
              <i className="fa-solid fa-user"></i> Full Dossier
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: 'var(--accent-amber)', fontSize: '13px' }}>
              GUEST SESSION ACTIVE
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Sign in with your student account to isolate your registered events, passes, and competition scores.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/student/login" className="btn btn-primary btn-sm" style={{ fontSize: '11px' }}>
              Sign In
            </Link>
          </div>
        </div>
      )}

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
          const r = ev.registration;
          const hasResult = Boolean(r.result || r.marks !== undefined || r.feedback);

          // Badge style helper
          const getResultBadge = () => {
            if (!r.result) return null;
            switch (r.result) {
              case 'WINNER':
                return (
                  <span
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid #eab308',
                      color: '#facc15',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🥇 WINNER
                  </span>
                );
              case 'RUNNER-UP':
                return (
                  <span
                    style={{
                      background: 'rgba(226, 232, 240, 0.12)',
                      border: '1px solid #cbd5e1',
                      color: '#e2e8f0',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🥈 RUNNER-UP
                  </span>
                );
              case 'SECOND RUNNER-UP':
                return (
                  <span
                    style={{
                      background: 'rgba(217, 119, 6, 0.15)',
                      border: '1px solid #b45309',
                      color: '#f59e0b',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🥉 SECOND RUNNER-UP
                  </span>
                );
              case 'PARTICIPANT':
                return (
                  <span
                    style={{
                      background: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid #3b82f6',
                      color: '#60a5fa',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🎖️ PARTICIPANT
                  </span>
                );
              case 'NOT ELIGIBLE':
                return (
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #ef4444',
                      color: '#f87171',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ⛔ NOT ELIGIBLE
                  </span>
                );
              default:
                return null;
            }
          };

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
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {getResultBadge()}
                    <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                      {ev.regStatus}
                    </span>
                  </div>
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '0.25rem' }}>{ev.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <i className="fa-regular fa-calendar" style={{ marginRight: '4px' }}></i> {ev.date}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i> {ev.venue}
                </p>

                {/* Declared Evaluation Result Panel */}
                {hasResult && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.85rem 1rem',
                      background: '#121622',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span className="mono-tag" style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>
                        OFFICIAL EVALUATION
                      </span>
                      {r.marks !== undefined && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: '#ffffff',
                            fontSize: '13px',
                          }}
                        >
                          Score: <span style={{ color: 'var(--accent-cyan)' }}>{r.marks}</span> / 100
                        </span>
                      )}
                    </div>
                    {r.feedback && (
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                          margin: '0.25rem 0',
                        }}
                      >
                        &ldquo;{r.feedback}&rdquo;
                      </p>
                    )}
                    <div
                      style={{
                        fontSize: '11px',
                        color:
                          r.certificate_eligible !== false ? 'var(--accent-emerald)' : 'var(--accent-red)',
                        marginTop: '0.4rem',
                      }}
                    >
                      <i
                        className={`fa-solid ${
                          r.certificate_eligible !== false ? 'fa-circle-check' : 'fa-circle-xmark'
                        }`}
                        style={{ marginRight: '4px' }}
                      ></i>
                      {r.certificate_issued
                        ? 'Certificate Officially Issued'
                        : r.certificate_eligible !== false
                        ? 'Certificate Eligible (Granted on Turnstile Verification)'
                        : 'Certificate Ineligible for this submission'}
                    </div>
                  </div>
                )}
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
                    {r.certificate_eligible !== false && (
                      <button
                        className="btn btn-cyan btn-sm"
                        onClick={() =>
                          setCertModalData({
                            isOpen: true,
                            title: ev.name,
                            student: ev.registration.name,
                            role: r.result ? `${r.result} &bull; Verified Attendee` : 'Verified Attendee',
                            date: ev.date.split(' • ')[0],
                          })
                        }
                      >
                        <i className="fa-solid fa-award"></i> CERTIFICATE AVAILABLE
                      </button>
                    )}
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
                      href={
                        ev.registration.access_token
                          ? `/registration-status/${ev.registration.access_token}`
                          : '/my-passes'
                      }
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
