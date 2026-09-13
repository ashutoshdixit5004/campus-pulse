'use client';

import React from 'react';
import { useToast } from './ToastProvider';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  studentName: string;
  role?: string;
  date?: string;
  authCode?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  eventTitle,
  studentName,
  role = 'Delegate Participant',
  date = 'October 24, 2026',
  authCode = 'CERT-2026-TN-0841',
}: CertificateModalProps) {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleDownload = () => {
    showToast('✓ Preparing printable certificate document...');
    window.print();
  };

  return (
    <div className="modal-overlay active">
      <div
        className="modal-card"
        style={{
          maxWidth: '720px',
          padding: '2.5rem',
          background: '#0e111a',
          border: '2px solid var(--accent-orange)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div className="mono-tag" style={{ color: 'var(--accent-orange)' }}>
            OFFICIAL MERIT CREDENTIAL
          </div>
          <button className="btn-icon" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Certificate Layout Canvas */}
        <div
          id="certificateDocumentCanvas"
          className="certificate-document"
          style={{
            border: '2px solid #232733',
            padding: '2.5rem',
            textAlign: 'center',
            background: '#080a0f',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: 'var(--accent-orange)',
              marginBottom: '0.5rem',
            }}
          >
            APEX INSTITUTE OF TECHNOLOGY &bull; CAMPUS PULSE
          </div>
          <h2 style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            CERTIFICATE OF PARTICIPATION
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            This official certificate verifies that
          </p>

          <h1 style={{ fontSize: '38px', color: 'var(--accent-orange)', marginBottom: '0.75rem' }}>
            {studentName}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              maxWidth: '500px',
              margin: '0 auto 1.75rem',
            }}
          >
            has actively attended and participated in{' '}
            <strong style={{ color: '#ffffff' }}>{eventTitle}</strong> as a verified{' '}
            <span style={{ color: 'var(--accent-cyan)' }}>{role}</span>. Physical venue turnstile check-in confirmed.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '2rem',
              borderTop: '1px solid #1f232d',
              paddingTop: '1.25rem',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div className="mono-tag" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                ISSUED DATE
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{date}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  border: '1px solid var(--accent-orange)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 4px',
                  color: 'var(--accent-orange)',
                }}
              >
                <i className="fa-solid fa-stamp"></i>
              </div>
              <div className="mono-tag" style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                DEAN ACCREDITED
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono-tag" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                AUTHENTICATION ID
              </div>
              <div
                className="mono-tag"
                style={{ color: 'var(--accent-cyan)', fontSize: '11px' }}
              >
                {authCode}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <i className="fa-solid fa-download"></i> Download Official PDF
          </button>
        </div>
      </div>
    </div>
  );
}
