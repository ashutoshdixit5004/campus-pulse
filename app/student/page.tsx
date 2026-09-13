'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CertificateModal from '@/components/CertificateModal';
import DigitalPass from '@/components/DigitalPass';
import { getStudentSession, clearStudentSession, StudentSession } from '@/lib/auth';
import { getRegistrations, getCertificates } from '@/lib/db';
import { RegistrationItem, CertificateItem, formatBranch } from '@/types/database';
import { useToast } from '@/components/ToastProvider';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [student, setStudent] = useState<StudentSession | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'passes' | 'certificates' | 'profile'>('events');
  const [selectedPassId, setSelectedPassId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Certificate Modal State
  const [certModalData, setCertModalData] = useState<{
    isOpen: boolean;
    title: string;
    student: string;
    role: string;
    date: string;
    authCode: string;
  }>({
    isOpen: false,
    title: '',
    student: '',
    role: '',
    date: '',
    authCode: '',
  });

  useEffect(() => {
    const session = getStudentSession();
    if (!session) {
      router.replace('/login?redirect=/student');
      return;
    }

    setStudent(session);

    // Load data isolated strictly to this student
    Promise.all([
      getRegistrations('ALL', undefined, session.student_id),
      getCertificates(),
    ]).then(([regs, certs]) => {
      // Filter strictly by student_id or email
      const studentRegs = regs.filter(
        (r) =>
          r.student_id === session.student_id ||
          (session.email && r.email?.toLowerCase() === session.email.toLowerCase())
      );
      setRegistrations(studentRegs);

      if (studentRegs.length > 0) {
        const verified = studentRegs.find((r) => r.status === 'VERIFIED');
        setSelectedPassId(verified ? verified.id : studentRegs[0].id);
      }

      const sName = (session.name || session.full_name || '').toLowerCase();
      const studentCerts = certs.filter(
        (c) =>
          c.student_id === session.student_id ||
          (Boolean(sName) && Boolean(c.student_name) && c.student_name!.toLowerCase().includes(sName))
      );
      setCertificates(studentCerts);
      setLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    fetch('/api/student/logout', { method: 'POST' }).catch(() => {});
    clearStudentSession();
    showToast('✓ Student session ended. Returning to login gateway.');
    router.replace('/login');
  };

  if (loading || !student) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '36px', color: 'var(--accent-orange)', marginBottom: '1.25rem' }}></i>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          AUTHENTICATING STUDENT PROFILE & REPOSITORIES...
        </div>
      </div>
    );
  }

  const studentName = student.name || student.full_name || 'Student';
  const attendedCount = registrations.filter((r) => r.checked_in).length;
  const verifiedCount = registrations.filter((r) => r.status === 'VERIFIED').length;
  const activePass = registrations.find((r) => r.id === selectedPassId);

  // Helper for winner badges
  const renderWinnerBadge = (result?: string) => {
    if (!result) return null;
    switch (result) {
      case 'WINNER':
        return (
          <span style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', color: '#facc15', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🥇 WINNER
          </span>
        );
      case 'RUNNER-UP':
        return (
          <span style={{ background: 'rgba(226, 232, 240, 0.12)', border: '1px solid #cbd5e1', color: '#e2e8f0', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🥈 RUNNER-UP
          </span>
        );
      case 'SECOND RUNNER-UP':
        return (
          <span style={{ background: 'rgba(217, 119, 6, 0.15)', border: '1px solid #b45309', color: '#f59e0b', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🥉 2ND RUNNER-UP
          </span>
        );
      case 'PARTICIPANT':
        return (
          <span style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
            🎖️ PARTICIPANT
          </span>
        );
      case 'NOT ELIGIBLE':
        return (
          <span style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
            ⛔ NOT ELIGIBLE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="view-section active">
      {/* Student Profile Hero Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(14, 18, 28, 0.95), rgba(20, 25, 38, 0.95))',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '2px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'var(--accent-cyan)',
            }}
          >
            {studentName.charAt(0)}
          </div>
          <div>
            <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
              AUTHENTICATED STUDENT PORTAL
            </div>
            <h1 style={{ fontSize: '32px', marginBottom: '0.25rem' }}>{studentName}</h1>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>
                <i className="fa-solid fa-id-badge" style={{ color: 'var(--accent-cyan)', marginRight: '4px' }}></i>
                Roll: <strong style={{ color: '#fff' }}>{student.student_id}</strong>
              </span>
              <span>
                <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--accent-cyan)', marginRight: '4px' }}></i>
                {student.course}
              </span>
              <span>
                <i className="fa-solid fa-building-columns" style={{ color: 'var(--accent-cyan)', marginRight: '4px' }}></i>
                {student.college}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/events" className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 0.9rem' }}>
            <i className="fa-solid fa-compass"></i> Discover Events
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem 0.9rem', color: 'var(--accent-red)' }}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="form-label" style={{ marginBottom: '0.25rem' }}>REGISTERED EVENTS</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--accent-orange)' }}>
            {registrations.length}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="form-label" style={{ marginBottom: '0.25rem' }}>VERIFIED PASSES</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {verifiedCount}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="form-label" style={{ marginBottom: '0.25rem' }}>CONFIRMED ATTENDANCE</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {attendedCount}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="form-label" style={{ marginBottom: '0.25rem' }}>ISSUED CERTIFICATES</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#facc15' }}>
            {certificates.length}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
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
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
          style={{
            background: activeTab === 'events' ? '#1f232e' : undefined,
            borderBottom: activeTab === 'events' ? '2px solid var(--accent-orange)' : undefined,
          }}
        >
          <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }}></i>
          My Events & Results ({registrations.length})
        </button>
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'passes' ? 'active' : ''}`}
          onClick={() => setActiveTab('passes')}
          style={{
            background: activeTab === 'passes' ? '#1f232e' : undefined,
            borderBottom: activeTab === 'passes' ? '2px solid var(--accent-orange)' : undefined,
          }}
        >
          <i className="fa-solid fa-ticket" style={{ marginRight: '6px' }}></i>
          Digital Entry Passes ({verifiedCount})
        </button>
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
          style={{
            background: activeTab === 'certificates' ? '#1f232e' : undefined,
            borderBottom: activeTab === 'certificates' ? '2px solid var(--accent-orange)' : undefined,
          }}
        >
          <i className="fa-solid fa-award" style={{ marginRight: '6px' }}></i>
          Official Certificates ({certificates.length})
        </button>
        <button
          className={`btn btn-secondary btn-sm ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          style={{
            background: activeTab === 'profile' ? '#1f232e' : undefined,
            borderBottom: activeTab === 'profile' ? '2px solid var(--accent-orange)' : undefined,
          }}
        >
          <i className="fa-solid fa-user" style={{ marginRight: '6px' }}></i>
          Institutional Dossier
        </button>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: MY EVENTS & RESULTS                                        */}
      {/* ===================================================================== */}
      {activeTab === 'events' && (
        <div>
          {registrations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {registrations.map((r) => {
                const hasResult = Boolean(r.result || r.marks !== undefined || r.feedback);
                return (
                  <div
                    key={r.id}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div className="mono-tag" style={{ color: 'var(--accent-orange)', fontSize: '10px' }}>
                          CAMPUS EVENT
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {renderWinnerBadge(r.result)}
                          <span className={`badge ${r.status === 'VERIFIED' ? 'badge-verified' : r.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>
                            {r.status}
                          </span>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '18px', marginBottom: '0.35rem' }}>
                        {r.event_name || 'Collegiate Event'}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Reg No: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{r.registration_number}</span>
                      </div>

                      {/* Declared Evaluation Result & Marks */}
                      {hasResult && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.85rem 1rem',
                            background: '#121622',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span className="mono-tag" style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>
                              EVALUATION SCORES
                            </span>
                            {r.marks !== undefined && (
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', fontSize: '13px' }}>
                                Score: <span style={{ color: 'var(--accent-cyan)' }}>{r.marks}</span> / 100
                              </span>
                            )}
                          </div>
                          {r.feedback && (
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0.35rem 0' }}>
                              &ldquo;{r.feedback}&rdquo;
                            </p>
                          )}
                          <div style={{ fontSize: '11px', color: r.certificate_eligible !== false ? 'var(--accent-emerald)' : 'var(--accent-red)', marginTop: '0.35rem' }}>
                            <i className={`fa-solid ${r.certificate_eligible !== false ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight: '4px' }}></i>
                            {r.certificate_issued ? 'Certificate Issued' : r.certificate_eligible !== false ? 'Eligible for Certificate' : 'Not Certificate Eligible'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: 'var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: r.checked_in ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                        <i className={`fa-solid ${r.checked_in ? 'fa-circle-check' : 'fa-clock'}`} style={{ marginRight: '4px' }}></i>
                        {r.checked_in ? 'Attended at Gate' : 'Pending Check-in'}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {r.status === 'VERIFIED' && (
                          <button
                            onClick={() => {
                              setSelectedPassId(r.id);
                              setActiveTab('passes');
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '11px' }}
                          >
                            <i className="fa-solid fa-qrcode"></i> View Pass
                          </button>
                        )}
                        {r.certificate_issued && (
                          <button
                            onClick={() => {
                              setCertModalData({
                                isOpen: true,
                                title: r.event_name || 'Event',
                                student: studentName,
                                role: r.result ? `${r.result} &bull; Participant` : 'Verified Attendee',
                                date: new Date().toLocaleDateString(),
                                authCode: `CERT-2026-ST-${student.student_id}`,
                              });
                            }}
                            className="btn btn-cyan btn-sm"
                            style={{ fontSize: '11px' }}
                          >
                            <i className="fa-solid fa-award"></i> Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '36px', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
              <h3 style={{ fontSize: '20px', marginBottom: '0.5rem' }}>No Registered Events Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                You have not registered for any collegiate events yet. Explore upcoming hackathons, tech talks, and cultural symposiums.
              </p>
              <Link href="/events" className="btn btn-primary">
                <i className="fa-solid fa-compass"></i> Discover Campus Events
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: DIGITAL ENTRY PASSES                                       */}
      {/* ===================================================================== */}
      {activeTab === 'passes' && (
        <div>
          {registrations.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {registrations.map((r) => (
                <button
                  key={r.id}
                  className={`role-btn ${r.id === selectedPassId ? 'active' : ''}`}
                  onClick={() => setSelectedPassId(r.id)}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  <i className="fa-solid fa-qrcode" style={{ marginRight: '6px' }}></i>
                  {r.event_name || 'Event'} ({r.status})
                </button>
              ))}
            </div>
          )}

          {activePass ? (
            <DigitalPass
              registration={activePass}
              eventName={activePass.event_name || 'Campus Event'}
              eventDate={activePass.events?.date ? `${activePass.events.date} • ${activePass.events.start_time || '09:00'}` : 'Nov 05, 2026 • 09:00 AM'}
              eventVenue={activePass.events?.venue || 'Campus Auditorium // Gate 02'}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <i className="fa-solid fa-ticket" style={{ fontSize: '36px', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
              <h3 style={{ fontSize: '20px', marginBottom: '0.5rem' }}>No Active Passes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
                Your registrations are awaiting coordinator verification before entry passes unlock.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: OFFICIAL CERTIFICATES                                      */}
      {/* ===================================================================== */}
      {activeTab === 'certificates' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {certificates.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    padding: '1.25rem',
                    background: '#131620',
                    border: 'var(--border-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-cyan)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-award" style={{ color: 'var(--accent-cyan)' }}></i>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '15px' }}>{cert.event_name || 'Event'}</strong>
                        {renderWinnerBadge(cert.result)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {cert.role || 'Delegate Participant'} &bull; {cert.event_date || new Date(cert.issued_at).toLocaleDateString()}
                      </div>
                      <div className="mono-tag" style={{ color: 'var(--accent-emerald)', fontSize: '9px', marginTop: '2px' }}>
                        {cert.certificate_number} &bull; VERIFIED CREDENTIAL
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        setCertModalData({
                          isOpen: true,
                          title: cert.event_name || 'Campus Event',
                          student: studentName,
                          role: cert.role || 'Verified Attendee',
                          date: cert.event_date || new Date(cert.issued_at).toLocaleDateString(),
                          authCode: cert.certificate_number,
                        })
                      }
                    >
                      <i className="fa-solid fa-eye"></i> View
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setCertModalData({
                          isOpen: true,
                          title: cert.event_name || 'Campus Event',
                          student: studentName,
                          role: cert.role || 'Verified Attendee',
                          date: cert.event_date || new Date(cert.issued_at).toLocaleDateString(),
                          authCode: cert.certificate_number,
                        });
                        setTimeout(() => window.print(), 400);
                      }}
                    >
                      <i className="fa-solid fa-download"></i> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <i className="fa-solid fa-award" style={{ fontSize: '36px', color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}></i>
              <h3 style={{ fontSize: '18px', marginBottom: '0.5rem' }}>No Certificates Earned Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '460px', margin: '0 auto' }}>
                Certificates are accredited after attending verified event turnstiles or upon winner declaration by coordinators.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 4: INSTITUTIONAL DOSSIER                                      */}
      {/* ===================================================================== */}
      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '1.25rem' }}>Institutional Student Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div>
              <div className="form-label">FULL LEGAL NAME</div>
              <div style={{ fontWeight: 600 }}>{studentName}</div>
            </div>
            <div>
              <div className="form-label">STUDENT ID / ROLL NO</div>
              <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {student.student_id}
              </div>
            </div>
            <div>
              <div className="form-label">COLLEGE / INSTITUTION</div>
              <div style={{ fontWeight: 600 }}>{student.college || 'SHEAT College of Engineering'}</div>
            </div>
            <div>
              <div className="form-label">CAMPUS BRANCH</div>
              <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                {formatBranch(student.branch) || 'Babatpur'}
              </div>
            </div>
            <div>
              <div className="form-label">DEGREE & PROGRAM</div>
              <div style={{ fontWeight: 600 }}>{student.course}</div>
            </div>
            <div>
              <div className="form-label">ACADEMIC SEMESTER</div>
              <div style={{ fontWeight: 600 }}>{student.semester || 'Year 3 // Sem 5'}</div>
            </div>
            <div>
              <div className="form-label">INSTITUTIONAL EMAIL</div>
              <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{student.email}</div>
            </div>
            <div>
              <div className="form-label">MOBILE PHONE</div>
              <div style={{ fontWeight: 600 }}>{student.phone || '+91 98765 43210'}</div>
            </div>
            <div>
              <div className="form-label">ACCOUNT SECURITY</div>
              <div style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                <i className="fa-solid fa-shield-check"></i> Authenticated Session
              </div>
            </div>
          </div>
        </div>
      )}

      <CertificateModal
        isOpen={certModalData.isOpen}
        onClose={() => setCertModalData((prev) => ({ ...prev, isOpen: false }))}
        eventTitle={certModalData.title}
        studentName={certModalData.student}
        role={certModalData.role}
        date={certModalData.date}
        authCode={certModalData.authCode}
      />
    </section>
  );
}
