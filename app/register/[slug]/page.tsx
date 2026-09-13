'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getEventBySlug, createRegistration } from '@/lib/db';
import { getStudentSession } from '@/lib/auth';
import { EventItem, RegistrationItem, StudentAccount } from '@/types/database';
import { useToast } from '@/components/ToastProvider';

export default function PublicRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggedInStudent, setLoggedInStudent] = useState<StudentAccount | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [college] = useState('SHEAT College of Engineering');
  const [branch, setBranch] = useState<'B.Tech CSE - Babatpur' | 'B.Tech CSE - Gahani' | ''>('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('Year 3 // Sem 5');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [teamName, setTeamName] = useState('');
  const [documentName, setDocumentName] = useState('student_id_card_scan.pdf');

  // Submission & Error State
  const [submittedReg, setSubmittedReg] = useState<RegistrationItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Check if student session is logged in, redirect to student login if unauthenticated
    const student = getStudentSession();
    if (!student) {
      router.replace(`/student/login?redirect=${encodeURIComponent(`/register/${slug}`)}`);
      return;
    }

    setLoggedInStudent(student);
    setFullName(student.name || student.full_name || '');
    setStudentId(student.student_id || '');
    setBranch((student.branch as any) || '');
    setCourse(student.course || '');
    setSemester(student.semester || 'Year 3 // Sem 5');
    setEmail(student.email || '');
    setPhone(student.phone || '');

    if (slug) {
      setLoading(true);
      const effectiveSlug = decodeURIComponent(String(slug)).trim();
      getEventBySlug(effectiveSlug)
        .then(async (ev) => {
          setEvent(ev);
          if (ev && student?.student_id) {
            try {
              const res = await fetch(`/api/registrations?eventId=${encodeURIComponent(ev.id)}&studentId=${encodeURIComponent(student.student_id)}`);
              if (res.ok) {
                const regs = await res.json();
                if (Array.isArray(regs) && regs.length > 0) {
                  const existing = regs.find((r: any) => r.event_id === ev.id || r.event_id === ev.slug);
                  if (existing) {
                    setSubmittedReg(existing);
                  }
                }
              }
            } catch (e) {
              console.warn('Could not verify existing registration:', e);
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load event:', err);
          setLoading(false);
        });
    }
  }, [slug, router]);

  const parseErrorMessage = (err: any): string => {
    const rawMsg = err?.message || err?.toString() || '';
    const raw = rawMsg.toUpperCase();
    if (raw.includes('DUPLICATE_REGISTRATION') || raw.includes('ALREADY REGISTERED')) {
      return 'ALREADY REGISTERED: A registration with this Student ID or Email already exists for this event.';
    }
    if (raw.includes('EVENT_CAPACITY_REACHED') || raw.includes('CAPACITY')) {
      return 'EVENT FULL: All available seats for this event have been claimed.';
    }
    if (raw.includes('DEADLINE_PASSED') || raw.includes('DEADLINE')) {
      return 'REGISTRATION DEADLINE PASSED: The registration cutoff window for this event has expired.';
    }
    if (raw.includes('REGISTRATION_CLOSED') || raw.includes('CLOSED')) {
      return 'REGISTRATION CLOSED: Online registration for this event is closed.';
    }
    if (raw.includes('INVALID_FORM_DATA')) {
      return 'INVALID FORM DATA: Please ensure all required fields are filled with valid institutional details.';
    }
    if (raw.includes('EVENT_NOT_FOUND')) {
      return 'EVENT NOT FOUND: The requested event could not be found in the registry.';
    }
    if (rawMsg && rawMsg !== 'REGISTRATION_FAILED' && rawMsg.length > 5) {
      return `REGISTRATION FAILED: ${rawMsg.replace(/^REGISTRATION_FAILED:\s*/, '')}`;
    }
    return 'REGISTRATION FAILED: Unable to submit credentials. Please verify your details and retry.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setErrorMessage(null);

    // Frontend pre-guard checks
    if (event.status === 'CLOSED') {
      setErrorMessage('REGISTRATION CLOSED: Registration for this event is closed.');
      return;
    }
    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      setErrorMessage('REGISTRATION DEADLINE PASSED: The registration deadline has passed.');
      return;
    }
    if (event.capacity && (event.registered_count || 0) >= event.capacity) {
      setErrorMessage('EVENT FULL: Event has reached its maximum seat capacity.');
      return;
    }

    if (!branch) {
      setErrorMessage('Please select your campus branch (Babatpur or Gahani).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          name: fullName.trim(),
          student_id: studentId.trim(),
          college: 'SHEAT College of Engineering',
          branch: branch.trim(),
          course: course.trim(),
          semester: semester.trim(),
          email: email.trim(),
          phone: phone.trim(),
          team_name: teamName.trim() || undefined,
          document_url: documentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'REGISTRATION_FAILED');
      }

      setSubmittedReg(data);
      showToast('✓ Registration submitted! Awaiting coordinator verification.');
    } catch (err: any) {
      const friendly = parseErrorMessage(err);
      setErrorMessage(friendly);
      showToast(friendly, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyStatusLink = () => {
    if (!submittedReg) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const url = `${origin}/registration-status/${submittedReg.access_token}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        showToast('✓ Private registration status link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 3000);
      });
    } else {
      showToast(url);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--accent-orange)' }}></i>
        <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>INITIALIZING PUBLIC REGISTRATION PORTAL...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-red)', marginBottom: '0.5rem' }}>
          ERROR 404 // INSTITUTIONAL REGISTRY
        </div>
        <h2 style={{ fontSize: '28px', marginBottom: '1rem' }}>EVENT NOT FOUND</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          No active event matches slug &quot;{slug}&quot;. The event may have been renamed, unlisted, or expired.
        </p>
        <Link href="/events" className="btn btn-primary">
          <i className="fa-solid fa-calendar-days"></i> Browse Active Events
        </Link>
      </div>
    );
  }

  const isClosed = event.status === 'CLOSED';
  const isDeadlinePassed = Boolean(event.registration_deadline && new Date() > new Date(event.registration_deadline));
  const isFull = Boolean(event.capacity && (event.registered_count || 0) >= event.capacity);
  const isRegistrationBlocked = isClosed || isDeadlinePassed || isFull;

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
            PUBLIC EVENT REGISTRATION PORTAL &bull; NO LOGIN REQUIRED
          </span>
        </div>
        <div className="mono-tag" style={{ color: 'var(--accent-cyan)' }}>
          /register/{event.slug}
        </div>
      </div>

      <div className="registration-page-grid">
        {/* Left: Event Hero Banner & Information */}
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
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {isClosed ? (
                <span className="badge badge-rejected">REGISTRATION CLOSED</span>
              ) : isFull ? (
                <span className="badge badge-rejected">EVENT FULL</span>
              ) : isDeadlinePassed ? (
                <span className="badge badge-rejected">REGISTRATION CLOSED</span>
              ) : (
                <span className="badge badge-live">
                  <span className="pulse-dot"></span> REGISTRATION OPEN
                </span>
              )}
              <span className="badge badge-upcoming">
                {Math.max(0, event.capacity - (event.registered_count || 0))} SEATS REMAINING
              </span>
            </div>
            <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
              {event.organizer_name.toUpperCase()} PRESENTS
            </div>
            <h1 style={{ fontSize: '40px', lineHeight: 1.1, marginBottom: '0.5rem' }}>
              {event.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {event.description}
            </p>
          </div>

          {/* Key Event Parameters */}
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
                <div className="form-label">AVAILABLE SEATS</div>
                <div style={{ fontWeight: 600 }}>
                  <span style={{ color: isFull ? 'var(--accent-red)' : 'var(--accent-emerald)' }}>
                    {Math.max(0, event.capacity - (event.registered_count || 0))} Available
                  </span>{' '}
                  ({event.capacity} Capacity)
                </div>
              </div>
              <div>
                <div className="form-label">REGISTRATION DEADLINE</div>
                <div style={{ fontWeight: 600, color: isDeadlinePassed ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                  {event.registration_deadline
                    ? new Date(event.registration_deadline).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Open until capacity'}
                </div>
              </div>
              <div>
                <div className="form-label">ORGANIZER CONTACT</div>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {event.organizer_contact}
                </div>
              </div>
            </div>
          </div>

          {/* Event Rules & Eligibility */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '15px', marginBottom: '0.75rem' }}>PARTICIPATION REQUIREMENTS & RULES</h4>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7 }}>
              <li>{event.eligibility || 'Open to all enrolled undergraduate & graduate STEM students.'}</li>
              <li>Teams of 1 to 4 authorized participants.</li>
              <li>Dual-sided College ID card mandatory for identity verification.</li>
              <li>Verified turnstile QR pass required for entrance; certificates awarded to attendees.</li>
            </ul>
          </div>
        </div>

        {/* Right: Registration Form or Post-Submission Card */}
        <div>
          {!submittedReg ? (
            <div id="publicRegisterFormCard" className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '22px', marginBottom: '0.25rem' }}>Student Registration Form</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
                Complete form to submit your registration for coordinator verification.
              </p>

              {loggedInStudent ? (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 240, 255, 0.05)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-cyan)' }}></i>
                    <span>
                      Logged in as <strong>{loggedInStudent.name}</strong> ({loggedInStudent.student_id})
                    </span>
                  </div>
                  <span className="mono-tag" style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>
                    AUTO-FILLED
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span>Already have an account?</span>
                  <Link href="/student/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
                    Sign In to auto-fill
                  </Link>
                </div>
              )}

              {/* Registration Blocked Notice */}
              {isRegistrationBlocked && (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <i className="fa-solid fa-ban" style={{ color: 'var(--accent-red)', fontSize: '20px' }}></i>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--accent-red)', fontSize: '13px' }}>
                      {isClosed
                        ? 'REGISTRATION CLOSED'
                        : isDeadlinePassed
                        ? 'REGISTRATION DEADLINE PASSED'
                        : 'EVENT FULL'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {isClosed
                        ? 'Online registration for this event is officially closed.'
                        : isDeadlinePassed
                        ? 'The registration deadline has passed. New submissions are not permitted.'
                        : 'All allocated seats have been reserved. Capacity limit reached.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Error State Notice */}
              {errorMessage && (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--accent-red)', fontSize: '18px' }}></i>
                  <div style={{ fontSize: '13px', color: '#ffb3b3', lineHeight: 1.4 }}>
                    {errorMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ashutosh Dixit"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isRegistrationBlocked || isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student ID / Roll Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 2503840100024"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      disabled={isRegistrationBlocked || isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">College / Institution (Locked)</label>
                    <input
                      type="text"
                      className="form-input"
                      value="SHEAT College of Engineering"
                      readOnly
                      disabled
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--text-secondary)',
                        cursor: 'not-allowed',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Campus Branch *</label>
                    <select
                      className="form-select"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value as any)}
                      required
                      disabled={isRegistrationBlocked || isSubmitting}
                      style={{ borderColor: !branch ? 'var(--accent-orange)' : undefined }}
                    >
                      <option value="">Select Campus Branch...</option>
                      <option value="B.Tech CSE - Babatpur">Babatpur</option>
                      <option value="B.Tech CSE - Gahani">Gahani</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course / Degree *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. B.Tech Computer Science"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                      disabled={isRegistrationBlocked || isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Year / Semester *</label>
                    <select
                      className="form-select"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      disabled={isRegistrationBlocked || isSubmitting}
                    >
                      <option value="Year 1 // Sem 1">Year 1 // Semester 1</option>
                      <option value="Year 2 // Sem 3">Year 2 // Semester 3</option>
                      <option value="Year 3 // Sem 5">Year 3 // Semester 5</option>
                      <option value="Year 4 // Sem 7">Year 4 // Semester 7</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Institutional Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="dixitashutosh5004@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isRegistrationBlocked || isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={isRegistrationBlocked || isSubmitting}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Required Document Upload (Student ID Card Scan) *</label>
                    <div
                      className="upload-dropzone"
                      style={{ padding: '1.25rem', opacity: isRegistrationBlocked ? 0.6 : 1 }}
                      onClick={() => !isRegistrationBlocked && setDocumentName(`id_card_${Date.now().toString(36)}.pdf`)}
                    >
                      <i
                        className="fa-solid fa-id-card"
                        style={{ fontSize: '24px', color: 'var(--accent-orange)', marginBottom: '0.25rem' }}
                      ></i>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{documentName} (Attached)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        PDF or JPEG format required for identity audit
                      </div>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Team Name (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CyberVanguard"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      disabled={isRegistrationBlocked || isSubmitting}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isRegistrationBlocked || isSubmitting}
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    <i className="fa-solid fa-paper-plane"></i>{' '}
                    {isSubmitting
                      ? 'SUBMITTING CREDENTIALS...'
                      : isClosed
                      ? 'REGISTRATION CLOSED'
                      : isDeadlinePassed
                      ? 'DEADLINE PASSED'
                      : isFull
                      ? 'EVENT AT CAPACITY'
                      : 'SUBMIT REGISTRATION FOR VERIFICATION'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Post-Submission Confirmation Screen */
            <div id="publicRegisterSuccessCard" className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '2px solid var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <i className="fa-solid fa-hourglass-half" style={{ fontSize: '32px', color: 'var(--accent-amber)' }}></i>
              </div>

              <div className="badge badge-pending" style={{ fontSize: '12px', padding: '5px 14px', marginBottom: '1rem' }}>
                PENDING VERIFICATION
              </div>

              <h2 style={{ fontSize: '28px', marginBottom: '0.25rem' }}>
                REGISTRATION RECEIVED
              </h2>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '1rem' }}>
                Registration Number: {submittedReg.registration_number}
              </div>

              {/* Callout box explaining private pass status */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(0, 240, 255, 0.05)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'center',
                }}
              >
                <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-cyan)' }}></i>
                <span>Keep this private status link safe to track your verification and digital pass status.</span>
              </div>

              {/* Private Access Link Display */}
              <div
                style={{
                  padding: '1.25rem',
                  background: '#0c0e15',
                  border: 'var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  margin: '1.25rem 0 1.5rem',
                  textAlign: 'left',
                }}
              >
                <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>
                  PRIVATE ACCESS LINK
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    wordBreak: 'break-all',
                    padding: '0.6rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')}/registration-status/{submittedReg.access_token}
                </div>
                <div
                  style={{
                    marginTop: '1rem',
                    borderTop: 'var(--border-hairline)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>STATUS:</span>
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>PENDING VERIFICATION</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCopyStatusLink}
                  className="btn btn-secondary"
                  style={{ minWidth: '200px' }}
                >
                  <i className={`fa-solid ${copiedLink ? 'fa-check' : 'fa-copy'}`}></i>{' '}
                  {copiedLink ? 'LINK COPIED!' : 'COPY STATUS LINK'}
                </button>
                <Link
                  href={`/registration-status/${submittedReg.access_token}`}
                  className="btn btn-primary"
                  style={{ minWidth: '200px' }}
                >
                  <i className="fa-solid fa-ticket"></i> TRACK REGISTRATION
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
