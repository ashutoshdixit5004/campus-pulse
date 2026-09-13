'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
  registrationUrl: string;
}

export default function QrShareModal({
  isOpen,
  onClose,
  eventTitle = 'Technova 2026',
  registrationUrl,
}: QrShareModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (registrationUrl && isOpen) {
      QRCode.toDataURL(registrationUrl, {
        width: 260,
        margin: 1,
        color: {
          dark: '#0b0c10',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [registrationUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div className="mono-tag" style={{ color: 'var(--accent-orange)' }}>
            PUBLIC REGISTRATION QR
          </div>
          <button className="btn-icon" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <h3 style={{ fontSize: '22px', marginBottom: '0.5rem' }}>
          {eventTitle} Registration QR
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Print or project this QR at orientation halls. Students scan to register without login.
        </p>

        <div
          className="qr-box"
          style={{ margin: '0 auto 1.5rem', width: '200px', height: '200px' }}
        >
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Registration QR Code"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ color: '#0b0c10', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              GENERATING QR...
            </div>
          )}
        </div>

        <div className="link-value-container" style={{ marginBottom: '1.5rem' }}>
          <span className="link-text">{registrationUrl}</span>
        </div>

        <button className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
