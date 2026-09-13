'use client';

import React, { useEffect, useState } from 'react';
import CertificateModal from '@/components/CertificateModal';
import { useToast } from '@/components/ToastProvider';
import { getCertificates, getRegistrations } from '@/lib/db';
import { CertificateItem, RegistrationItem } from '@/types/database';

export default function StudentProfilePage() {
  const { showToast } = useToast();
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

  useEffect(() => {
    Promise.all([getCertificates(), getRegistrations('ALL')]).then(([certs, regs]) => {
      // Alex Chen's records or all verified records
      const studentRegs = regs.filter((r) => r.student_id === 'STU-2024-8841' || r.name.toLowerCase().includes('alex'));
      setMyRegistrations(studentRegs.length > 0 ? studentRegs : regs.slice(0, 4));

      const studentCerts = certs.filter(
        (c) => c.student_name?.toLowerCase().includes('alex') || c.student_name === 'Alex Chen'
      );
      setCertificates(studentCerts.length > 0 ? studentCerts : certs);
      setLoading(false);
    });
  }, []);

  const registeredCount = myRegistrations.length || 4;
  const attendedCount = myRegistrations.filter((r) => r.checked_in).length || 2;
  const certsCount = certificates.length;

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          STUDENT CREDENTIALS
        </div>
        <h1 style={{ fontSize: '36px' }}>Academic Profile & Certificates</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Verified collegiate event participation record and accredited certificates.
        </p>
      </div>

      <div className="profile-layout-grid">
        {/* Left: Student Info */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #2a2e3d, #141720)',
              border: 'var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)',
              fontSize: '26px',
              fontWeight: 'bold',
              marginBottom: '1.25rem',
            }}
          >
            AC
          </div>

          <h2 style={{ fontSize: '22px' }}>Alex Chen</h2>
          <div className="mono-tag" style={{ color: 'var(--accent-cyan)', marginTop: '2px' }}>
            STU-2024-8841
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div className="form-label">COLLEGE</div>
              <div style={{ fontWeight: 600 }}>Apex Institute of Technology</div>
            </div>
            <div>
              <div className="form-label">DEGREE & COURSE</div>
              <div style={{ fontWeight: 600 }}>B.Tech - Computer Science & Engineering</div>
            </div>
            <div>
              <div className="form-label">YEAR & SEMESTER</div>
              <div style={{ fontWeight: 600 }}>3rd Year // Semester 5</div>
            </div>
            <div>
              <div className="form-label">EMAIL</div>
              <div style={{ fontSize: '13px' }}>alex.chen@campus.edu</div>
            </div>
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
                          student: cert.student_name || 'Alex Chen',
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
                          student: cert.student_name || 'Alex Chen',
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
              <div>No certificates issued yet. Certificates are granted after turnstile check-in.</div>
            </div>
          )}
        </div>
      </div>

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
