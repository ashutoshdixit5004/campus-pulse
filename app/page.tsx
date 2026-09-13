'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/CertificateModal';
import { getEvents, getRegistrations, getCertificates } from '@/lib/db';
import { EventItem, RegistrationItem, CertificateItem } from '@/types/database';

export default function StudentHomePage() {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [activePassReg, setActivePassReg] = useState<RegistrationItem | null>(null);

  useEffect(() => {
    Promise.all([getEvents(), getRegistrations('ALL'), getCertificates()]).then(([evs, regs, certs]) => {
      setEvents(evs);
      setRegistrations(regs);
      setCertificates(certs);
      const verifiedWithPass = regs.find((r) => r.status === 'VERIFIED' && r.pass_token);
      setActivePassReg(verifiedWithPass || null);
    });
  }, []);

  const registeredTotal = registrations.length;
  const attendedTotal = registrations.filter((r) => r.checked_in).length;
  const pendingTotal = registrations.filter((r) => r.status === 'PENDING').length;
  const certsTotal = certificates.length;
  const latestCert = certificates[0] || null;

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>
          COLLEGIATE EXPERIENTIAL NETWORK
        </div>
        <h1
          style={{
            fontSize: '52px',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            maxWidth: '800px',
          }}
        >
          YOUR CAMPUS, IN MOTION.
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '16px',
            marginTop: '0.75rem',
            maxWidth: '650px',
          }}
        >
          Discover flagship events, access your verified QR entry passes, monitor credential verification, and download accredited participation certificates.
        </p>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          <Link href="/events" className="btn btn-primary">
            <i className="fa-solid fa-compass"></i> EXPLORE EVENTS
          </Link>
          <Link href="/my-events" className="btn btn-secondary">
            <i className="fa-solid fa-calendar-check"></i> MY EVENTS
          </Link>
          <Link href="/my-passes" className="btn btn-secondary">
            <i className="fa-solid fa-ticket"></i> MY PASSES
          </Link>
          <Link href="/certificates" className="btn btn-secondary">
            <i className="fa-solid fa-award"></i> CERTIFICATES
          </Link>
        </div>
      </div>

      <div className="student-home-grid">
        {/* Left Column: Active Digital Pass Highlight & Upcoming Feed */}
        <div>
          {/* Active Pass Banner */}
          {activePassReg ? (
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                border: 'var(--border-orange)',
                marginBottom: '2rem',
                background: 'linear-gradient(180deg, rgba(255, 87, 34, 0.05), rgba(18, 20, 27, 0.9))',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span className="badge badge-verified">
                  <i className="fa-solid fa-check"></i> DIGITAL PASS READY
                </span>
                <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                  GATE 02 CHECK-IN
                </span>
              </div>
              <h2 style={{ fontSize: '26px', marginBottom: '0.25rem' }}>
                {activePassReg.event_name || 'Technova 2026 Hackathon'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '1.25rem' }}>
                Oct 24, 2026 &bull; 09:00 AM &bull; Main Tech Auditorium // Complex B
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: 'var(--border-hairline)',
                }}
              >
                <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                  PASS ID: <span style={{ color: 'var(--accent-cyan)' }}>{activePassReg.pass_token || 'PASS-TN-0492'}</span>
                </div>
                <Link href="/my-passes" className="btn btn-primary btn-sm">
                  <i className="fa-solid fa-qrcode"></i> VIEW DIGITAL PASS
                </Link>
              </div>
            </div>
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                marginBottom: '2rem',
                border: 'var(--border-hairline)',
              }}
            >
              <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>
                REGISTRATION OPEN
              </div>
              <h2 style={{ fontSize: '22px', marginBottom: '0.5rem' }}>Join Campus Competitions</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '1rem' }}>
                Browse live events, complete registration, and receive your digital QR pass.
              </p>
              <Link href="/events" className="btn btn-primary btn-sm">
                <i className="fa-solid fa-compass"></i> EXPLORE EVENTS
              </Link>
            </div>
          )}

          {/* Curated Upcoming Events */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '16px' }} className="font-mono">
                UPCOMING CAMPUS EVENTS
              </h3>
              <Link href="/events" style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                VIEW ALL &rarr;
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.slice(0, 3).map((ev) => {
                const reg = registrations.find((r) => r.event_id === ev.id || r.event_id === ev.slug);
                return (
                  <div
                    key={ev.id}
                    style={{
                      padding: '1rem',
                      background: '#141721',
                      border: 'var(--border-hairline)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{ev.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {ev.date} &bull; {ev.venue}
                      </div>
                    </div>
                    {reg ? (
                      <span className={`badge badge-${reg.status.toLowerCase()}`}>
                        {reg.status === 'VERIFIED' ? 'PASS READY' : reg.status}
                      </span>
                    ) : (
                      <Link href={`/register/${ev.slug}`} className="btn btn-secondary btn-sm">
                        REGISTER
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Student Summary Metrics */}
        <div>
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '1.25rem' }} className="font-mono">
              MY EVENT PORTFOLIO
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="stat-card">
                <div className="stat-label">Registered</div>
                <div className="stat-value">{registeredTotal}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Attended</div>
                <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
                  {attendedTotal}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending Review</div>
                <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>
                  {pendingTotal}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Certificates</div>
                <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
                  {certsTotal}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Download Callout */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              background: 'rgba(0, 240, 255, 0.03)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <i className="fa-solid fa-award" style={{ color: 'var(--accent-cyan)', fontSize: '20px' }}></i>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                {latestCert ? 'Latest Certificate Ready' : 'Academic Credentials'}
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {latestCert
                ? `${latestCert.event_name} • Verified attendance check-in logged.`
                : 'Turnstile check-in automatically awards accredited participation certificates.'}
            </p>
            {latestCert ? (
              <button
                className="btn btn-cyan btn-sm"
                style={{ width: '100%' }}
                onClick={() => setIsCertModalOpen(true)}
              >
                <i className="fa-solid fa-download"></i> DOWNLOAD CERTIFICATE (PDF)
              </button>
            ) : (
              <Link href="/certificates" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                <i className="fa-solid fa-award"></i> VIEW CERTIFICATES VAULT
              </Link>
            )}
          </div>
        </div>
      </div>

      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        eventTitle={latestCert?.event_name || 'National E-Summit 2026'}
        studentName={latestCert?.student_name || 'Alex Chen'}
        role={latestCert?.role || 'Delegate Participant'}
        date={latestCert?.event_date || 'October 10, 2026'}
        authCode={latestCert?.certificate_number || 'CERT-2026-NES-0192'}
      />
    </section>
  );
}
