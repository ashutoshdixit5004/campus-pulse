'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/CertificateModal';
import { useToast } from '@/components/ToastProvider';
import { getCertificates } from '@/lib/db';
import { getStudentSession, setStudentSession } from '@/lib/auth';
import { CertificateItem, StudentAccount } from '@/types/database';

export default function CertificatesVaultPage() {
  const { showToast } = useToast();
  const [allCertificates, setAllCertificates] = useState<CertificateItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [currentStudent, setCurrentStudent] = useState<StudentAccount | null>(null);
  const [showAllScope, setShowAllScope] = useState(false);
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

  const loadCerts = async () => {
    setLoading(true);
    const student = getStudentSession();
    setCurrentStudent(student);

    const certs = await getCertificates();
    setAllCertificates(certs);

    if (student && !showAllScope) {
      const studentName = (student.name || student.full_name || '').toLowerCase();
      const filtered = certs.filter(
        (c) =>
          c.student_id === student.student_id ||
          (Boolean(studentName) && Boolean(c.student_name) && c.student_name!.toLowerCase().includes(studentName))
      );
      setCertificates(filtered);
    } else {
      setCertificates(certs);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCerts();
  }, [showAllScope]);

  const handleDownloadDirect = (title: string) => {
    showToast(`✓ Downloading verified credential for: ${title}`);
  };

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          ACADEMIC RECOGNITION // VERIFIED CREDENTIALS
        </div>
        <h1 style={{ fontSize: '36px' }}>Student Certificates Vault</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Accredited merit certificates issued for confirmed turnstile attendance and declared competition awards.
        </p>
      </div>

      {/* Student Session & Scope Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {currentStudent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mono-tag" style={{ color: 'var(--accent-cyan)' }}>
              STUDENT VAULT: {currentStudent.name} ({currentStudent.student_id})
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Viewing public vault.</span>
            <Link
              href="/student/login"
              style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontSize: '12px' }}
            >
              Sign in for personal vault
            </Link>
          </div>
        )}

        {currentStudent && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`btn btn-secondary btn-sm ${!showAllScope ? 'active' : ''}`}
              onClick={() => setShowAllScope(false)}
              style={{
                fontSize: '11px',
                background: !showAllScope ? '#1f232e' : undefined,
                borderBottom: !showAllScope ? '2px solid var(--accent-orange)' : undefined,
              }}
            >
              My Certificates ({certificates.length})
            </button>
            <button
              className={`btn btn-secondary btn-sm ${showAllScope ? 'active' : ''}`}
              onClick={() => setShowAllScope(true)}
              style={{
                fontSize: '11px',
                background: showAllScope ? '#1f232e' : undefined,
                borderBottom: showAllScope ? '2px solid var(--accent-orange)' : undefined,
              }}
            >
              All College Awards ({allCertificates.length})
            </button>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: 'var(--accent-orange)' }}></i>
            <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>RETRIEVING ACCREDITED CERTIFICATES...</div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{cert.event_name || 'Campus Event'}</span>
                      {cert.result === 'WINNER' && (
                        <span style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', color: '#facc15', padding: '1px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                          🥇 WINNER
                        </span>
                      )}
                      {cert.result === 'RUNNER-UP' && (
                        <span style={{ background: 'rgba(226, 232, 240, 0.12)', border: '1px solid #cbd5e1', color: '#e2e8f0', padding: '1px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                          🥈 RUNNER-UP
                        </span>
                      )}
                      {cert.result === 'SECOND RUNNER-UP' && (
                        <span style={{ background: 'rgba(217, 119, 6, 0.15)', border: '1px solid #b45309', color: '#f59e0b', padding: '1px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                          🥉 2ND RUNNER-UP
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {cert.role || 'Delegate Participant'} &bull; {cert.student_name || 'Student Attendee'} &bull; {cert.event_date || new Date(cert.issued_at).toLocaleDateString()}
                    </div>
                    <div className="mono-tag" style={{ color: 'var(--accent-emerald)', fontSize: '9px', marginTop: '2px' }}>
                      {cert.certificate_number} &bull; VERIFIED ATTENDEE {cert.marks !== undefined ? `&bull; SCORE: ${cert.marks}/100` : ''}
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
                        student: cert.student_name || 'Student Attendee',
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
                        student: cert.student_name || 'Student Attendee',
                        role: cert.role || 'Delegate Participant',
                        date: cert.event_date || new Date(cert.issued_at).toLocaleDateString(),
                        authCode: cert.certificate_number,
                      });
                      setTimeout(() => {
                        window.print();
                      }, 400);
                    }}
                  >
                    <i className="fa-solid fa-download"></i> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <i className="fa-solid fa-award" style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.4 }}></i>
            <h3 style={{ fontSize: '20px', marginBottom: '0.5rem' }}>No Certificates Issued Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Certificates are automatically issued to registered participants after attendance is verified at event turnstiles.
            </p>
            <Link href="/events" className="btn btn-primary">
              <i className="fa-solid fa-compass"></i> Discover Campus Events
            </Link>
          </div>
        )}
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
