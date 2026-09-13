'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/CertificateModal';
import { useToast } from '@/components/ToastProvider';
import { getCertificates, getRegistrations } from '@/lib/db';
import { CertificateItem, RegistrationItem, formatBranch } from '@/types/database';
import { getStudentSession, setStudentSession, StudentSession } from '@/lib/auth';

export default function StudentProfilePage() {
  const { showToast } = useToast();
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadStudentData = async (activeStudent: StudentSession | null) => {
    setLoading(true);
    if (!activeStudent) {
      setMyRegistrations([]);
      setCertificates([]);
      setLoading(false);
      return;
    }

    const [certs, regs] = await Promise.all([
      getCertificates(),
      getRegistrations('ALL', undefined, undefined, activeStudent.student_id),
    ]);

    // Isolate only registrations belonging to this student
    const studentRegs = regs.filter(
      (r) =>
        r.student_id === activeStudent.student_id ||
        r.email.toLowerCase() === activeStudent.email.toLowerCase()
    );
    setMyRegistrations(studentRegs);

    const regIdSet = new Set(studentRegs.map((r) => r.id));
    const activeName = (activeStudent.full_name || activeStudent.name || '').toLowerCase();
    const studentCerts = certs.filter(
      (c) =>
        regIdSet.has(c.registration_id) ||
        (c.student_name && c.student_name.toLowerCase() === activeName)
    );
    setCertificates(studentCerts);
    setLoading(false);
  };

  useEffect(() => {
    const current = getStudentSession();
    setStudent(current);
    loadStudentData(current);
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const registeredCount = myRegistrations.length;
  const attendedCount = myRegistrations.filter((r) => r.checked_in).length;
  const certsCount = certificates.length;

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          STUDENT CREDENTIALS // PASSPORT IDENTITY
        </div>
        <h1 style={{ fontSize: '36px' }}>Academic Profile & Certificates</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Verified collegiate event participation record and accredited certificates for your account.
        </p>
      </div>

      {!student ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <i className="fa-solid fa-user-lock" style={{ fontSize: '40px', color: 'var(--accent-orange)', marginBottom: '1rem' }}></i>
          <h2 style={{ fontSize: '24px', marginBottom: '0.5rem' }}>No Student Account Signed In</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '14px' }}>
            Please sign in with your student account or create a new profile to view your personal registrations, turnstile passes, and merit certificates.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/student/login" className="btn btn-primary">
              <i className="fa-solid fa-right-to-bracket"></i> Student Login
            </Link>
            <Link href="/student/signup" className="btn btn-secondary">
              <i className="fa-solid fa-user-plus"></i> Create Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="profile-layout-grid">
          {/* Left: Student Info */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.15)',
                border: '1px solid var(--accent-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-orange)',
                fontSize: '26px',
                fontWeight: 'bold',
                marginBottom: '1.25rem',
              }}
            >
              {getInitials(student.full_name || student.name || 'Student')}
            </div>

            <h2 style={{ fontSize: '22px' }}>{student.full_name || student.name}</h2>
            <div className="mono-tag" style={{ color: 'var(--accent-cyan)', marginTop: '2px' }}>
              {student.student_id}
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div className="form-label">COLLEGE</div>
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
                <div className="form-label">EMAIL</div>
                <div style={{ fontSize: '13px' }}>{student.email}</div>
              </div>
              {student.phone && (
                <div>
                  <div className="form-label">PHONE</div>
                  <div style={{ fontSize: '13px' }}>{student.phone}</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: 'var(--border-hairline)' }}>
              <div className="mono-tag" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                ACTIVITY STATS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ padding: '0.75rem', background: '#0c0e15', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>{registeredCount}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>REGISTERED</div>
                </div>
                <div style={{ padding: '0.75rem', background: '#0c0e15', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {attendedCount}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>ATTENDED</div>
                </div>
                <div style={{ padding: '0.75rem', background: '#0c0e15', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {certsCount}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>CERTIFICATES</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Certificates Vault */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '18px' }}>ISSUED EVENT CERTIFICATES</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Accredited certificates awarded for confirmed physical turnstile attendance.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: 'var(--accent-orange)' }}></i>
                <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>LOADING CERTIFICATES...</div>
              </div>
            ) : certificates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid var(--accent-cyan)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className="fa-solid fa-award" style={{ color: 'var(--accent-cyan)' }}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{cert.event_name || 'Campus Event'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {cert.role || 'Delegate Participant'} &bull; {cert.event_date || new Date(cert.issued_at).toLocaleDateString()}
                        </div>
                        <div className="mono-tag" style={{ color: 'var(--accent-emerald)', fontSize: '9px', marginTop: '2px' }}>
                          {cert.certificate_number} &bull; VERIFIED ATTENDEE
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
                            student: cert.student_name || student.full_name || student.name || 'Student',
                            role: cert.role || 'Delegate Participant',
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
                            student: cert.student_name || student.full_name || student.name || 'Student',
                            role: cert.role || 'Delegate Participant',
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
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-award" style={{ fontSize: '32px', marginBottom: '0.75rem', opacity: 0.4, display: 'block' }}></i>
                <div>No certificates issued for this student profile yet. Certificates are granted after turnstile check-in and admin evaluation.</div>
              </div>
            )}
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
