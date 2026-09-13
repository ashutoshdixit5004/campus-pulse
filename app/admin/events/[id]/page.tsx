'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEvents, getRegistrations, getCertificates, issueCertificatesForEvent } from '@/lib/db';
import { EventItem, RegistrationItem, CertificateItem } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/ToastProvider';
import QrShareModal from '@/components/QrShareModal';

export default function AdminEventDetailPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REGISTRATION' | 'VERIFICATION' | 'ATTENDANCE' | 'CERTIFICATES'>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const loadEventData = async () => {
    const [evs, allCerts] = await Promise.all([getEvents(), getCertificates()]);
    const match = evs.find((e) => e.id === eventId || e.slug === eventId);
    if (match) {
      setEvent(match);
      const regs = await getRegistrations('ALL', match.id);
      setRegistrations(regs);
      setCertificates(allCerts.filter((c) => c.event_id === match.id || c.event_id === match.slug));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const origin = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const regUrl = event ? `${origin}/register/${event.slug}` : '';

  const handleCopyLink = () => {
    if (!regUrl) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(regUrl).then(() => {
        setCopiedLink(true);
        showToast('✓ Public event registration link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 3000);
      }).catch(() => {
        showToast(regUrl);
      });
    } else {
      showToast(regUrl);
    }
  };

  const handleShareLink = () => {
    if (!event || !regUrl) return;
    if (navigator.share) {
      navigator.share({
        title: `${event.name} // Event Registration`,
        text: `Register for ${event.name} on Campus Pulse. Zero-login event pass!`,
        url: regUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleDispatchCerts = async () => {
    if (!event) return;
    setIsDispatching(true);
    try {
      const count = await issueCertificatesForEvent(event.id);
      showToast(`✓ ${count} Certificates issued for verified attendees!`);
      await loadEventData();
    } catch (err: any) {
      showToast('Error issuing certificates.', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--accent-orange)' }}></i>
        <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>LOADING EVENT TELEMETRY...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
          No event found matching ID &quot;{eventId}&quot;.
        </p>
        <Link href="/admin/events" className="btn btn-primary">
          Back to Events Registry
        </Link>
      </div>
    );
  }

  // Real Database Statistics
  const totalRegs = registrations.length;
  const pendingCount = registrations.filter((r) => r.status === 'PENDING').length;
  const verifiedCount = registrations.filter((r) => r.status === 'VERIFIED').length;
  const checkedInCount = registrations.filter((r) => r.checked_in).length;
  const certsCount = certificates.length;
  const attendanceRate = verifiedCount > 0 ? ((checkedInCount / verifiedCount) * 100).toFixed(1) : '0.0';

  return (
    <section className="view-section active">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
            EVENT CONTROL CENTER // {event.slug.toUpperCase()}
          </div>
          <h1 style={{ fontSize: '36px', marginBottom: '0.25rem' }}>{event.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            <i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i>{event.date} &bull; {event.start_time} - {event.end_time} &bull;{' '}
            <i className="fa-solid fa-location-dot" style={{ margin: '0 6px' }}></i>{event.venue}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href={`/events/${event.slug}`} className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> VIEW PUBLIC EVENT
          </Link>
          <Link href={`/admin/scanner?event=${event.slug}`} className="btn btn-primary btn-sm">
            <i className="fa-solid fa-qrcode"></i> OPEN SCANNER
          </Link>
        </div>
      </div>

      {/* Quick Actions Hub */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.75rem' }}>
        <div className="mono-tag" style={{ color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-bolt" style={{ color: 'var(--accent-orange)' }}></i> QUICK ACTIONS
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleCopyLink} className="btn btn-primary btn-sm">
            <i className="fa-solid fa-copy"></i> COPY REGISTRATION LINK
          </button>
          <Link href={`/events/${event.slug}`} className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-eye"></i> VIEW PUBLIC EVENT
          </Link>
          <Link href={`/admin/registrations?eventId=${event.id}`} className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-users"></i> VIEW REGISTRATIONS ({totalRegs})
          </Link>
          <Link href={`/admin/verification?eventId=${event.id}`} className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-user-check"></i> VERIFY ({pendingCount})
          </Link>
          <Link href={`/admin/scanner?event=${event.slug}`} className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-qrcode"></i> OPEN SCANNER
          </Link>
          <Link href={`/admin/attendance?eventId=${event.id}`} className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-chart-pie"></i> ATTENDANCE ({checkedInCount})
          </Link>
          <Link href={`/admin/certificates?eventId=${event.id}`} className="btn btn-secondary btn-sm">
            <i className="fa-solid fa-award"></i> CERTIFICATES ({certsCount})
          </Link>
        </div>
      </div>

      {/* Quick Statistics Counters */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Registered</div>
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{totalRegs}</div>
          <div className="stat-sub">{event.capacity} Capacity ({Math.max(0, event.capacity - totalRegs)} left)</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{pendingCount}</div>
          <div className="stat-sub">Needs verification</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Verified</div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{verifiedCount}</div>
          <div className="stat-sub">Passes activated</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Checked In</div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{checkedInCount}</div>
          <div className="stat-sub">{attendanceRate}% Turnout</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Certificates</div>
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{certsCount}</div>
          <div className="stat-sub">Accredited attendees</div>
        </div>
      </div>

      {/* 5 Organized Control Center Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: 'var(--border-hairline)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
          onClick={() => setActiveTab('OVERVIEW')}
          style={{ background: activeTab === 'OVERVIEW' ? 'var(--accent-orange)' : undefined, color: activeTab === 'OVERVIEW' ? '#000' : undefined, fontWeight: activeTab === 'OVERVIEW' ? 700 : undefined }}
        >
          <i className="fa-solid fa-circle-info"></i> EVENT OVERVIEW
        </button>
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'REGISTRATION' ? 'active' : ''}`}
          onClick={() => setActiveTab('REGISTRATION')}
          style={{ background: activeTab === 'REGISTRATION' ? 'var(--accent-orange)' : undefined, color: activeTab === 'REGISTRATION' ? '#000' : undefined, fontWeight: activeTab === 'REGISTRATION' ? 700 : undefined }}
        >
          <i className="fa-solid fa-id-badge"></i> REGISTRATION ({totalRegs})
        </button>
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'VERIFICATION' ? 'active' : ''}`}
          onClick={() => setActiveTab('VERIFICATION')}
          style={{ background: activeTab === 'VERIFICATION' ? 'var(--accent-orange)' : undefined, color: activeTab === 'VERIFICATION' ? '#000' : undefined, fontWeight: activeTab === 'VERIFICATION' ? 700 : undefined }}
        >
          <i className="fa-solid fa-user-check"></i> VERIFICATION ({pendingCount})
        </button>
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'ATTENDANCE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ATTENDANCE')}
          style={{ background: activeTab === 'ATTENDANCE' ? 'var(--accent-orange)' : undefined, color: activeTab === 'ATTENDANCE' ? '#000' : undefined, fontWeight: activeTab === 'ATTENDANCE' ? 700 : undefined }}
        >
          <i className="fa-solid fa-list-check"></i> ATTENDANCE ({checkedInCount})
        </button>
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'CERTIFICATES' ? 'active' : ''}`}
          onClick={() => setActiveTab('CERTIFICATES')}
          style={{ background: activeTab === 'CERTIFICATES' ? 'var(--accent-orange)' : undefined, color: activeTab === 'CERTIFICATES' ? '#000' : undefined, fontWeight: activeTab === 'CERTIFICATES' ? 700 : undefined }}
        >
          <i className="fa-solid fa-award"></i> CERTIFICATES ({certsCount})
        </button>
      </div>

      {/* 1. EVENT OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="event-detail-grid">
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '1rem' }}>Event Specifications</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {event.description || 'No description provided.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', fontSize: '13px' }}>
              <div>
                <div className="form-label">CATEGORY</div>
                <div style={{ fontWeight: 600 }}>{event.category}</div>
              </div>
              <div>
                <div className="form-label">SCHEDULE STATUS</div>
                <StatusBadge status={event.event_status} />
              </div>
              <div>
                <div className="form-label">DATE & TIME</div>
                <div style={{ fontWeight: 600 }}>{event.date} ({event.start_time} - {event.end_time})</div>
              </div>
              <div>
                <div className="form-label">VENUE</div>
                <div style={{ fontWeight: 600 }}>{event.venue}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '1rem' }}>Governance & Rules</h3>
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="form-label">ORGANIZER</div>
              <div style={{ fontWeight: 600 }}>{event.organizer_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '2px' }}>{event.organizer_contact}</div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="form-label">ELIGIBILITY</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {event.eligibility || 'Open to all enrolled undergraduate & graduate STEM students.'}
              </div>
            </div>
            <div>
              <div className="form-label">RULES</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {event.rules || 'Teams of 1-4. Physical college ID card mandatory for turnstile entry.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REGISTRATION */}
      {activeTab === 'REGISTRATION' && (
        <div>
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem 2rem',
              marginBottom: '2rem',
              background: 'rgba(255, 87, 34, 0.04)',
              border: '1px solid rgba(255, 87, 34, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
                  PUBLIC ZERO-LOGIN REGISTRATION LINK
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#fff', wordBreak: 'break-all' }}>
                  {regUrl}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={handleCopyLink} className="btn btn-secondary btn-sm">
                  <i className={`fa-solid ${copiedLink ? 'fa-check' : 'fa-copy'}`}></i> {copiedLink ? 'COPIED!' : 'COPY LINK'}
                </button>
                <button type="button" onClick={handleShareLink} className="btn btn-secondary btn-sm">
                  <i className="fa-solid fa-share-nodes"></i> SHARE LINK
                </button>
                <button type="button" onClick={() => setIsQrModalOpen(true)} className="btn btn-cyan btn-sm">
                  <i className="fa-solid fa-qrcode"></i> REGISTRATION QR
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '1rem' }}>Registered Students ({totalRegs})</h3>
            {registrations.length > 0 ? (
              <div className="table-container">
                <table className="pulse-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student ID</th>
                      <th>Course</th>
                      <th>Reg Number</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{r.student_id}</td>
                        <td>{r.course}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{r.registration_number}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No registrations received yet for this event. Share the registration link to begin accepting students.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. VERIFICATION */}
      {activeTab === 'VERIFICATION' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '18px' }}>Pending Verification Queue ({pendingCount})</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Audited students will automatically receive a verified digital turnstile pass.
              </p>
            </div>
            <Link href={`/admin/verification?eventId=${event.id}`} className="btn btn-primary btn-sm">
              <i className="fa-solid fa-user-check"></i> Open Verification Console
            </Link>
          </div>

          {pendingCount > 0 ? (
            <div className="table-container">
              <table className="pulse-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Course</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.filter((r) => r.status === 'PENDING').map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{r.student_id}</td>
                      <td>{r.course}</td>
                      <td>{r.email}</td>
                      <td>
                        <Link href="/admin/verification" className="btn btn-secondary btn-sm">
                          Audit in Console
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '32px', color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}></i>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>All Registrations Audited</div>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>There are no pending student applications waiting for coordinator verification.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '18px' }}>Turnstile Check-in Telemetry ({checkedInCount} / {verifiedCount})</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Real-time check-ins verified at entrance gates.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href={`/admin/scanner?event=${event.slug}`} className="btn btn-primary btn-sm">
                <i className="fa-solid fa-qrcode"></i> Launch Gate Scanner
              </Link>
              <Link href={`/admin/attendance?eventId=${event.id}`} className="btn btn-secondary btn-sm">
                <i className="fa-solid fa-chart-pie"></i> Full Attendance Roster
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>TURNOUT RATE</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{attendanceRate}% ({checkedInCount} Present)</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#1c202d', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, parseFloat(attendanceRate)))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald))',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="pulse-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Pass Token</th>
                  <th>Check-in Time</th>
                  <th>Gate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.filter((r) => r.status === 'VERIFIED').map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{r.student_id}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{r.pass_token || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{r.checkin_time || '—'}</td>
                    <td>{r.gate || '—'}</td>
                    <td>
                      {r.checked_in ? (
                        <span className="badge badge-verified"><i className="fa-solid fa-check"></i> CHECKED IN</span>
                      ) : (
                        <span className="badge badge-pending">NOT CHECKED IN</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CERTIFICATES */}
      {activeTab === 'CERTIFICATES' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '18px' }}>Accredited Certificates ({certsCount})</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Issued strictly to verified attendees confirmed present at turnstiles.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleDispatchCerts}
              disabled={isDispatching || checkedInCount === 0}
            >
              <i className="fa-solid fa-award"></i> {isDispatching ? 'DISPATCHING...' : 'DISPATCH CERTIFICATES'}
            </button>
          </div>

          {certificates.length > 0 ? (
            <div className="table-container">
              <table className="pulse-table">
                <thead>
                  <tr>
                    <th>Certificate Number</th>
                    <th>Student Name</th>
                    <th>Role</th>
                    <th>Issued Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {cert.certificate_number}
                      </td>
                      <td style={{ fontWeight: 600 }}>{cert.student_name || 'Student Attendee'}</td>
                      <td>{cert.role || 'Delegate Participant'}</td>
                      <td style={{ fontSize: '12px' }}>{new Date(cert.issued_at).toLocaleDateString()}</td>
                      <td>
                        <span className="badge badge-verified">
                          <i className="fa-solid fa-check"></i> ACCREDITED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-award" style={{ fontSize: '32px', marginBottom: '0.75rem', opacity: 0.5 }}></i>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>No Certificates Dispatched Yet</div>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                Check in students at turnstile scanner, then click Dispatch Certificates above to issue tamper-proof merit credentials.
              </p>
            </div>
          )}
        </div>
      )}

      <QrShareModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        eventTitle={event.name}
        registrationUrl={regUrl}
      />
    </section>
  );
}
