'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getRegistrationByAccessToken, getEventBySlug } from '@/lib/db';
import { RegistrationItem, EventItem } from '@/types/database';
import DigitalPass from '@/components/DigitalPass';
import StatusBadge from '@/components/StatusBadge';

export default function RegistrationStatusPage() {
  const params = useParams();
  const token = params?.access_token as string;

  const [registration, setRegistration] = useState<RegistrationItem | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getRegistrationByAccessToken(token).then(async (reg) => {
        setRegistration(reg);
        if (reg) {
          const ev = await getEventBySlug(reg.event_id);
          setEvent(ev);
        }
        setLoading(false);
      });
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--accent-orange)' }}></i>
        <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>RETRIEVING PRIVATE STUDENT CREDENTIALS...</div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Invalid or Expired Access Token</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
          This private registration link does not match any record. Please check the URL provided when submitting your registration.
        </p>
        <Link href="/" className="btn btn-primary">Return to Home</Link>
      </div>
    );
  }

  return (
    <section className="view-section active">
      {/* Header Notice */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          background: 'rgba(255, 87, 34, 0.08)',
          border: '1px solid rgba(255, 87, 34, 0.3)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-lock" style={{ color: 'var(--accent-orange)' }}></i>
          <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>
            SECURE PRIVATE ACCESS PORTAL &bull; ZERO LOGIN VERIFIED
          </span>
        </div>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)' }}>
          TOKEN: {token.slice(0, 14)}...
        </div>
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
          REGISTRATION DOSSIER // {event?.name || registration.event_name || 'CAMPUS EVENT'}
        </div>
        <h1 style={{ fontSize: '38px', marginBottom: '0.5rem' }}>
          {registration.status === 'VERIFIED'
            ? 'Registration Verified'
            : registration.status === 'REJECTED'
            ? 'Registration Rejected'
            : 'Waiting for Verification'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Candidate: <strong>{registration.name}</strong> &bull; Roll: <strong>{registration.student_id}</strong>
        </p>

        {/* Status Callout */}
        <div style={{ marginTop: '1.25rem' }}>
          {registration.status === 'PENDING' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.5rem',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '999px',
                fontSize: '14px',
                color: 'var(--accent-amber)',
                fontWeight: 600,
              }}
            >
              <span>⏳</span> Verification in progress
            </div>
          )}

          {registration.status === 'VERIFIED' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.6rem 1.5rem',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '999px',
                  fontSize: '14px',
                  color: 'var(--accent-emerald)',
                  fontWeight: 600,
                }}
              >
                <span>✓</span> Registration verified &bull; <span>🎟</span> Digital pass ready
              </div>
              <a
                href="#digitalPassCard"
                className="btn btn-primary btn-sm"
                style={{ padding: '0.55rem 1.5rem', fontSize: '13px' }}
              >
                <i className="fa-solid fa-ticket"></i> VIEW DIGITAL PASS
              </a>
            </div>
          )}

          {registration.status === 'REJECTED' && (
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '0.85rem 1.75rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--accent-rose)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✕</span> Registration rejected
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Rejection Reason: <strong>{registration.rejection_reason || 'Ineligible student credentials or blurred ID upload.'}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Digital Pass or Pending Card */}
      <div id="digitalPassCard">
        <DigitalPass
          registration={registration}
          eventName={event?.name || registration.event_name || 'Technova 2026 // 48-Hr Hackathon'}
          eventDate={event ? `${event.date} • ${event.start_time}` : 'Oct 24, 2026 • 09:00 AM'}
          eventVenue={event ? `${event.venue} • Gate 02` : 'Main Tech Auditorium // Complex B • Gate 02'}
        />
      </div>

      {/* Registration Details Overview */}
      <div style={{ maxWidth: '680px', margin: '2rem auto 0' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '1rem' }} className="font-mono">
            REGISTRATION SUMMARY
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '13px' }}>
            <div>
              <div className="form-label">EVENT</div>
              <div style={{ fontWeight: 600 }}>{event?.name || registration.event_name || 'Campus Event'}</div>
            </div>
            <div>
              <div className="form-label">STUDENT NAME</div>
              <div style={{ fontWeight: 600 }}>{registration.name}</div>
            </div>
            <div>
              <div className="form-label">REGISTRATION NUMBER</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{registration.registration_number}</div>
            </div>
            <div>
              <div className="form-label">CURRENT STATUS</div>
              <StatusBadge status={registration.status} />
            </div>
            <div>
              <div className="form-label">COLLEGE & COURSE</div>
              <div style={{ color: 'var(--text-secondary)' }}>{registration.college} &bull; {registration.course}</div>
            </div>
            <div>
              <div className="form-label">SUBMITTED DATE</div>
              <div style={{ color: 'var(--text-secondary)' }}>{new Date(registration.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
