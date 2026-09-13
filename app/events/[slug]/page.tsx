'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEventBySlug } from '@/lib/db';
import { EventItem } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getEventBySlug(slug).then((ev) => {
        setEvent(ev);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--accent-orange)' }}></i>
        <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>LOADING EVENT SPECIFICATION...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>The event slug &quot;{slug}&quot; could not be resolved in the database.</p>
        <Link href="/events" className="btn btn-primary">Back to Discover</Link>
      </div>
    );
  }

  return (
    <section className="view-section active">
      {/* Public Header Notice */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          background: 'rgba(0, 240, 255, 0.06)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-globe" style={{ color: 'var(--accent-cyan)' }}></i>
          <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>
            EVENT INFORMATION // ZERO-LOGIN CAMPUS ACCESS
          </span>
        </div>
        <div className="mono-tag" style={{ color: 'var(--accent-cyan)' }}>
          /events/{event.slug}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Left: Banner & Description */}
        <div>
          <div
            style={{
              width: '100%',
              minHeight: '260px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #1e2436, #0d1017)',
              border: 'var(--border-active)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem' }}>
              <StatusBadge status={event.status} />
              <StatusBadge status={event.event_status} />
            </div>
            <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
              {event.organizer_name.toUpperCase()} PRESENTS
            </div>
            <h1 style={{ fontSize: '38px', lineHeight: 1.1, marginBottom: '0.5rem' }}>
              {event.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {event.description}
            </p>
          </div>

          {/* Key Parameters */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div>
                <div className="form-label">DATE & TIME</div>
                <div style={{ fontWeight: 600 }}>{event.date} &bull; {event.start_time} - {event.end_time}</div>
              </div>
              <div>
                <div className="form-label">VENUE</div>
                <div style={{ fontWeight: 600 }}>{event.venue}</div>
              </div>
              <div>
                <div className="form-label">SEAT CAPACITY</div>
                <div style={{ fontWeight: 600 }}>{event.capacity} Seats ({event.registered_count || 0} Claimed)</div>
              </div>
              <div>
                <div className="form-label">ORGANIZER CONTACT</div>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{event.organizer_contact}</div>
              </div>
            </div>
          </div>

          {/* Rules & Eligibility */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '15px', marginBottom: '0.75rem' }}>PARTICIPATION REQUIREMENTS & RULES</h4>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '0.5rem' }}><strong>Eligibility:</strong> {event.eligibility || 'Open to all enrolled undergraduate & graduate college students.'}</p>
              <p><strong>Rules:</strong> {event.rules || 'Bring physical college ID card. Turnstile QR check-in mandatory for merit certificate.'}</p>
            </div>
          </div>
        </div>

        {/* Right: Registration Callout & Quick Link */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>
              REGISTRATION DESK
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '0.5rem' }}>Join This Event</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
              Direct zero-login registration. Fill out your student information and receive a private access link to track verification and unlock your Digital QR Pass.
            </p>

            <div style={{ marginBottom: '1.5rem', background: '#090a0e', padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Confirmed Registrations</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{event.verified_count || 0} Verified</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Capacity</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.capacity} Seats</span>
              </div>
            </div>

            <Link href={`/register/${event.slug}`} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              <i className="fa-solid fa-arrow-right"></i> PROCEED TO REGISTRATION FORM
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="form-label" style={{ marginBottom: '0.5rem' }}>PUBLIC REGISTRATION LINK</div>
            <div className="link-value-container" style={{ margin: '0 0 1rem' }}>
              <span className="link-text">/register/{event.slug}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Share this link with college peers. No registration account or password is required.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
