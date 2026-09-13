'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DigitalPass from '@/components/DigitalPass';
import { getRegistrations } from '@/lib/db';
import { RegistrationItem } from '@/types/database';

export default function MyPassesPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [activeRegId, setActiveRegId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRegistrations('ALL').then((regs) => {
      setRegistrations(regs);
      if (regs.length > 0) {
        // Default to first verified registration, or first registration
        const verified = regs.find((r) => r.status === 'VERIFIED');
        setActiveRegId(verified ? verified.id : regs[0].id);
      }
      setLoading(false);
    });
  }, []);

  const activeReg = registrations.find((r) => r.id === activeRegId);

  return (
    <section className="view-section active">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          OFFICIAL ENTRY CREDENTIAL
        </div>
        <h1 style={{ fontSize: '38px' }}>Digital Event Pass</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
          Present this official digital barcode at campus entrance turnstiles or coordinator scanner stations for instant verification.
        </p>

        {/* Pass Selector from Real Registrations */}
        {registrations.length > 1 && (
          <div
            style={{
              display: 'inline-flex',
              background: '#151821',
              border: 'var(--border-active)',
              borderRadius: 'var(--radius-pill)',
              padding: '3px',
              marginTop: '1.5rem',
              flexWrap: 'wrap',
              gap: '4px',
            }}
          >
            {registrations.map((r) => {
              const isSelected = r.id === activeRegId;
              const isVerified = r.status === 'VERIFIED';
              const isPending = r.status === 'PENDING';
              return (
                <button
                  key={r.id}
                  className={`role-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setActiveRegId(r.id)}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  <i
                    className={`fa-solid ${
                      isVerified ? 'fa-qrcode' : isPending ? 'fa-hourglass-half' : 'fa-ban'
                    }`}
                    style={{
                      marginRight: '6px',
                      color: isVerified
                        ? 'var(--accent-cyan)'
                        : isPending
                        ? 'var(--accent-amber)'
                        : 'var(--accent-rose)',
                    }}
                  ></i>
                  {r.event_name || 'Event'} ({r.status})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--accent-orange)' }}></i>
          <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>RETRIEVING ACTIVE PASS CREDENTIALS...</div>
        </div>
      ) : activeReg ? (
        <DigitalPass
          registration={activeReg}
          eventName={activeReg.event_name || 'Campus Event'}
          eventDate={activeReg.events?.date ? `${activeReg.events.date} • ${activeReg.events.start_time || '09:00'}` : 'Oct 24, 2026 • 09:00 AM'}
          eventVenue={activeReg.events?.venue || 'Main Tech Auditorium • Gate 02'}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <i className="fa-solid fa-ticket" style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
          <h3 style={{ fontSize: '22px', marginBottom: '0.5rem' }}>No Active Passes Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            You do not currently have any registered event passes in your session. Browse upcoming events to claim zero-login participation tickets.
          </p>
          <Link href="/events" className="btn btn-primary">
            <i className="fa-solid fa-compass"></i> Discover Active Events
          </Link>
        </div>
      )}
    </section>
  );
}
