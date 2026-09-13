'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { RegistrationItem } from '@/types/database';
import { useToast } from './ToastProvider';

interface DigitalPassProps {
  registration: RegistrationItem;
  eventName?: string;
  eventDate?: string;
  eventVenue?: string;
}

export default function DigitalPass({
  registration,
  eventName = 'Campus Event',
  eventDate = 'Upcoming Session',
  eventVenue = 'Campus Venue',
}: DigitalPassProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { showToast } = useToast();

  const isVerified = registration.status === 'VERIFIED';
  const isPending = registration.status === 'PENDING';
  const isRejected = registration.status === 'REJECTED';

  const passToken = registration.pass_token || `PASS-${registration.student_id.slice(-4)}`;

  useEffect(() => {
    if (isVerified && passToken) {
      QRCode.toDataURL(passToken, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0b0c10',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [isVerified, passToken]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/registration-status/${registration.access_token}`;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          showToast('✓ Digital pass link copied to clipboard!');
        })
        .catch(() => {
          showToast(`Pass Link: ${shareUrl}`);
        });
    }
  };

  if (isPending) {
    return (
      <div className="ticket-container">
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderColor: 'rgba(245, 158, 11, 0.4)',
          }}
        >
          <i
            className="fa-solid fa-lock"
            style={{ fontSize: '38px', color: 'var(--accent-amber)', marginBottom: '1rem' }}
          ></i>
          <div className="badge badge-pending" style={{ marginBottom: '0.75rem' }}>
            PASS NOT AVAILABLE
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '0.5rem' }}>
            Registration Awaiting Verification
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              maxWidth: '440px',
              margin: '0 auto 1.5rem',
            }}
          >
            Your registration has been submitted and is currently being audited by the event coordinator. Your scannable digital QR pass will appear here automatically once approved.
          </p>
          <div className="mono-tag" style={{ color: 'var(--text-muted)' }}>
            EVENT: {eventName.toUpperCase()}
          </div>
          <div
            style={{
              marginTop: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--accent-cyan)',
            }}
          >
            REGISTRATION NO: {registration.registration_number}
          </div>
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="ticket-container">
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderColor: 'rgba(239, 68, 68, 0.4)',
          }}
        >
          <i
            className="fa-solid fa-ban"
            style={{ fontSize: '38px', color: 'var(--accent-rose)', marginBottom: '1rem' }}
          ></i>
          <div className="badge badge-rejected" style={{ marginBottom: '0.75rem' }}>
            REGISTRATION REJECTED
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '0.5rem' }}>
            Application Not Approved
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
              maxWidth: '460px',
              margin: '0 auto 1rem',
            }}
          >
            Reason for rejection: <strong>{registration.rejection_reason || 'Ineligible student credentials or blurred ID upload.'}</strong>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            Please contact the event organizing desk or student affairs office for clarification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-container">
      <div className="ticket-pass" id="ticketPassApproved">
        {/* Main Body */}
        <div className="ticket-main">
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div className="mono-tag" style={{ color: 'var(--accent-orange)', fontSize: '11px', letterSpacing: '0.12em' }}>
                CAMPUS PULSE &bull; EVENT PASS
              </div>
              <span className="badge badge-verified" style={{ fontWeight: 700 }}>
                <i className="fa-solid fa-circle-check"></i> PASS STATUS: VALID
              </span>
            </div>
            <h2 style={{ fontSize: '30px', marginBottom: '0.25rem' }}>
              {registration.event_name || eventName}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Official Scannable Credential &bull; Zero-Login Verified
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              margin: '2rem 0',
            }}
          >
            <div>
              <div className="form-label">STUDENT NAME</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{registration.name}</div>
            </div>
            <div>
              <div className="form-label">STUDENT ID</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {registration.student_id}
              </div>
            </div>
            <div>
              <div className="form-label">REGISTRATION ID</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {registration.registration_number}
              </div>
            </div>
            <div>
              <div className="form-label">PASS ID</div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--accent-cyan)',
                }}
              >
                {passToken}
              </div>
            </div>
            <div>
              <div className="form-label">DATE & TIME</div>
              <div style={{ fontSize: '13px' }}>{eventDate}</div>
            </div>
            <div>
              <div className="form-label">VENUE & GATE</div>
              <div style={{ fontSize: '13px' }}>{eventVenue}</div>
            </div>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <i
              className="fa-solid fa-shield-halved"
              style={{ color: 'var(--accent-orange)', marginRight: '4px' }}
            ></i>
            Bring physical college ID for turnstile credential audit. Non-transferable.
          </div>
        </div>

        {/* Perforated Stub with QR Code */}
        <div className="ticket-stub">
          <div className="mono-tag" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
            SCAN AT TURNSTILE
          </div>

          <div className="qr-box">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code for ${passToken}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ color: '#0b0c10', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                GENERATING QR...
              </div>
            )}
          </div>

          <div className="mono-tag" style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>
            {passToken}
          </div>
        </div>
      </div>

      {/* Pass Action Controls */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '2rem',
        }}
      >
        <button className="btn btn-primary" onClick={handlePrint} id="downloadPassBtn">
          <i className="fa-solid fa-print"></i> DOWNLOAD / PRINT PASS
        </button>
        <button className="btn btn-secondary" onClick={handleShare} id="sharePassBtn">
          <i className="fa-solid fa-share-nodes"></i> SHARE PASS / COPY LINK
        </button>
      </div>
    </div>
  );
}
