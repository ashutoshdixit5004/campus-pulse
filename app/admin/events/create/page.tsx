'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/lib/db';
import { useToast } from '@/components/ToastProvider';
import QrShareModal from '@/components/QrShareModal';

export default function CreateEventPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('Technova 2026 // Annual Hackathon');
  const [description, setDescription] = useState(
    'The flagship collegiate engineering tournament of the semester. 48 hours of hands-on prototyping, AI tracks, and industry maker mentorship.'
  );
  const [category, setCategory] = useState('Technical');
  const [status, setStatus] = useState<'OPEN' | 'CLOSED' | 'DRAFT'>('OPEN');
  const [date, setDate] = useState('2026-10-24');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  const [venue, setVenue] = useState('Main Tech Auditorium // Complex B');
  const [capacity, setCapacity] = useState(150);
  const [deadline, setDeadline] = useState('2026-10-22T23:59');
  const [organizerName, setOrganizerName] = useState('ACM Student Chapter & Dept of CSE');
  const [organizerContact, setOrganizerContact] = useState('acm@campus.edu • +1 555-0192');
  const [eligibility, setEligibility] = useState(
    'Open to all enrolled undergraduate & graduate STEM students'
  );
  const [rules, setRules] = useState(
    'Teams of 1-4. Bring physical college ID card. Turnstile check-in mandatory for certificate.'
  );

  const [createdSlug, setCreatedSlug] = useState('');
  const [createdEvent, setCreatedEvent] = useState<any | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug whenever name changes
  const computedSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'new-event';

  const origin = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const activeSlug = createdEvent ? createdEvent.slug : (createdSlug || computedSlug);
  const displayUrl = `${origin}/register/${activeSlug}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalSlug = computedSlug;

    try {
      const newEv = await createEvent({
        slug: finalSlug,
        name,
        description,
        category,
        status,
        event_status: 'UPCOMING',
        date,
        start_time: startTime,
        end_time: endTime,
        venue,
        capacity: Number(capacity),
        registration_deadline: new Date(deadline).toISOString(),
        organizer_name: organizerName,
        organizer_contact: organizerContact,
        eligibility,
        rules,
      });

      const canonicalSlug = newEv?.slug || finalSlug;
      setCreatedSlug(canonicalSlug);
      setCreatedEvent(newEv);
      showToast(`✓ Event Published! Unique link generated: /register/${canonicalSlug}`);
    } catch (err) {
      console.error(err);
      showToast('Error creating event.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(displayUrl)
      .then(() => showToast('✓ Link copied to clipboard!'))
      .catch(() => showToast(`Copied: ${displayUrl}`));
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${createdEvent?.name || name} // Registration`,
          text: `Register for ${createdEvent?.name || name} on Campus Pulse. No login required!`,
          url: displayUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          CAMPUS CONTROL // DISPATCH ARCHITECT
        </div>
        <h1 style={{ fontSize: '36px' }}>Create Event & Generate Registration Link</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Configure event parameters, rules, and automatically generate a zero-login student registration link.
        </p>
      </div>

      {createdEvent ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <i className="fa-solid fa-circle-check" style={{ fontSize: '38px', color: 'var(--accent-emerald)' }}></i>
          </div>

          <span className="badge badge-verified" style={{ fontSize: '13px', padding: '6px 18px', marginBottom: '1.25rem' }}>
            EVENT PUBLISHED
          </span>

          <h2 style={{ fontSize: '36px', marginBottom: '0.5rem' }}>{createdEvent.name}</h2>
          <div className="mono-tag" style={{ color: 'var(--accent-orange)', fontSize: '14px', marginBottom: '1.5rem' }}>
            REGISTRATION LINK GENERATED
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '580px', margin: '0 auto 1.75rem' }}>
            The public registration endpoint is live and accessible without student login. Students can submit credentials directly to receive verified turnstile passes.
          </p>

          <div
            style={{
              padding: '1.25rem 1.5rem',
              background: '#0a0d14',
              border: '1px solid rgba(255, 87, 34, 0.3)',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '680px',
              margin: '0 auto 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <i className="fa-solid fa-link" style={{ color: 'var(--accent-orange)' }}></i>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#fff', wordBreak: 'break-all' }}>
                {displayUrl}
              </span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleCopyLink}>
              <i className="fa-regular fa-copy"></i> COPY LINK
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button className="btn btn-secondary" onClick={handleShareLink}>
              <i className="fa-solid fa-share-nodes"></i> SHARE
            </button>
            <button className="btn btn-cyan" onClick={() => setIsQrModalOpen(true)}>
              <i className="fa-solid fa-qrcode"></i> REGISTRATION QR
            </button>
            <Link href={`/events/${createdEvent.slug}`} className="btn btn-secondary">
              <i className="fa-solid fa-eye"></i> VIEW PUBLIC EVENT
            </Link>
            <Link href={`/admin/events/${createdEvent.id}`} className="btn btn-primary">
              <i className="fa-solid fa-sliders"></i> EVENT CONTROL CENTER
            </Link>
          </div>

          <div style={{ borderTop: 'var(--border-hairline)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setCreatedEvent(null);
                setName('Annual Campus Hackathon 2026');
              }}
            >
              <i className="fa-solid fa-plus"></i> Create Another Event
            </button>
            <Link href="/admin/events" className="btn btn-secondary btn-sm">
              <i className="fa-solid fa-calendar-days"></i> Back to Events Registry
            </Link>
          </div>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* Left: Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <h3
              style={{
                fontSize: '17px',
                marginBottom: '1.25rem',
                borderBottom: 'var(--border-hairline)',
                paddingBottom: '0.5rem',
              }}
            >
              01 // EVENT SPECIFICATIONS
            </h3>

            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group full-width">
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Event Description *</label>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Technical">Technical (Hackathon)</option>
                  <option value="Cultural">Cultural & Arts</option>
                  <option value="Robotics">Robotics & Hardware</option>
                  <option value="Entrepreneurship">Entrepreneurship & E-Summit</option>
                  <option value="Academic">Academic Symposium</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Registration Status *</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="OPEN">Open for Registration</option>
                  <option value="CLOSED">Registration Closed</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Event Poster / Banner Image</label>
                <div className="upload-dropzone">
                  <i
                    className="fa-solid fa-cloud-arrow-up"
                    style={{ fontSize: '28px', color: 'var(--accent-orange)', marginBottom: '0.5rem' }}
                  ></i>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>
                    technova_poster_banner_2026.webp (Attached)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Click or drag to replace 16:9 banner
                  </div>
                </div>
              </div>
            </div>

            <h3
              style={{
                fontSize: '17px',
                marginBottom: '1.25rem',
                borderBottom: 'var(--border-hairline)',
                paddingBottom: '0.5rem',
              }}
            >
              02 // SCHEDULE & VENUE
            </h3>

            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Venue *</label>
                <input
                  type="text"
                  className="form-input"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>
            </div>

            <h3
              style={{
                fontSize: '17px',
                marginBottom: '1.25rem',
                borderBottom: 'var(--border-hairline)',
                paddingBottom: '0.5rem',
              }}
            >
              03 // CAPACITY & POLICIES
            </h3>

            <div className="form-grid" style={{ marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label">Maximum Capacity *</label>
                <input
                  type="number"
                  className="form-input"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Deadline *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Organizer Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Organizer Contact *</label>
                <input
                  type="text"
                  className="form-input"
                  value={organizerContact}
                  onChange={(e) => setOrganizerContact(e.target.value)}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Eligibility *</label>
                <input
                  type="text"
                  className="form-input"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Event Rules</label>
                <textarea
                  className="form-textarea"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ padding: '0.8rem 2rem' }}
              >
                <i className="fa-solid fa-bolt"></i>{' '}
                {isSubmitting ? 'INITIALIZING ENDPOINT...' : 'CREATE EVENT & INITIALIZE LINK'}
              </button>
              <Link href="/admin" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Right: Generated Link & Post-Creation Terminal */}
        <div>
          <div className="system-link-box" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <span className="badge badge-verified">
                <i className="fa-solid fa-check"></i> EVENT CREATED
              </span>
              <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
                AUTO GENERATED ENDPOINT
              </span>
            </div>

            <h4 style={{ fontSize: '16px', margin: '0.5rem 0 0.25rem' }}>
              STUDENT REGISTRATION LINK
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Share this unique public URL directly with students. Students register without requiring an account or password.
            </p>

            <div className="link-value-container">
              <i className="fa-solid fa-link" style={{ color: 'var(--accent-orange)' }}></i>
              <span className="link-text" id="generatedLinkDisplay">
                {displayUrl}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <button className="btn btn-primary btn-sm" onClick={handleCopyLink}>
                <i className="fa-regular fa-copy"></i> COPY LINK
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleShareLink}>
                <i className="fa-solid fa-share-nodes"></i> SHARE LINK
              </button>
              <button className="btn btn-cyan btn-sm" onClick={() => setIsQrModalOpen(true)}>
                <i className="fa-solid fa-qrcode"></i> REGISTRATION QR
              </button>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: 'var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}
            >
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-cyan)', marginRight: '6px' }}></i>
              <strong>Zero Login Protocol:</strong> Share this link with students to collect registrations. Submissions queue automatically for admin verification before QR entry passes are unlocked.
            </div>
          </div>

          {/* Quick Event Capacity Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="mono-tag" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              CAPACITY TELEMETRY // {computedSlug.toUpperCase()}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SEAT CAPACITY</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>
                  {capacity} Seats
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>REGISTERED</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--accent-orange)' }}>
                  0
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>VERIFIED</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  0
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PENDING</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--accent-amber)' }}>
                  0
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                href="/admin/registrations"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                <i className="fa-solid fa-users-viewfinder"></i> Verification Queue
              </Link>
              <Link
                href={`/register/${computedSlug}`}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                <i className="fa-solid fa-eye"></i> Preview Public Form
              </Link>
            </div>
          </div>
        </div>
      </div>
      )}

      <QrShareModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        eventTitle={name}
        registrationUrl={displayUrl}
      />
    </section>
  );
}
