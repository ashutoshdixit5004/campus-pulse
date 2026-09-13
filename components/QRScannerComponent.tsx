'use client';

import React, { useEffect, useRef, useState } from 'react';
import { validatePassToken, ScanValidationResult } from '@/lib/db';
import { RegistrationItem } from '@/types/database';
import { useToast } from './ToastProvider';

interface QRScannerComponentProps {
  selectedEventId: string;
  selectedGate: string;
  onCheckinSuccess: (result: ScanValidationResult) => void;
}

export default function QRScannerComponent({
  selectedEventId,
  selectedGate,
  onCheckinSuccess,
}: QRScannerComponentProps) {
  const [manualInput, setManualInput] = useState('');
  const [lastResult, setLastResult] = useState<ScanValidationResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const scannerRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const lastScanRef = useRef<{ token: string; time: number }>({ token: '', time: 0 });
  const { showToast } = useToast();

  const handleValidate = async (token: string) => {
    if (!token.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsValidating(true);

    try {
      const result = await validatePassToken(token, selectedEventId, selectedGate.split(' - ')[0]);
      setLastResult(result);

      if (result.status === 'VALID') {
        showToast(`✓ Turnstile Unlocked: ${result.registration?.name} checked in.`);
        onCheckinSuccess(result);
      } else if (result.status === 'DUPLICATE') {
        showToast('⚠ Duplicate Scan: Attendee already checked in.', 'warning');
      } else if (result.status === 'UNVERIFIED') {
        showToast('✕ Entry Denied: Registration not verified.', 'error');
      } else if (result.status === 'WRONG_EVENT') {
        showToast('⚠ Wrong Event: Pass belongs to a different schedule.', 'warning');
      } else {
        showToast('✕ Invalid Pass scanned.', 'error');
      }
    } catch (err: any) {
      showToast('Validation query error.', 'error');
    } finally {
      setIsValidating(false);
      isProcessingRef.current = false;
    }
  };

  const handleResetScanner = () => {
    setLastResult(null);
    lastScanRef.current = { token: '', time: 0 };
    isProcessingRef.current = false;
  };

  const startCamera = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader-target');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          const now = Date.now();
          if (isProcessingRef.current) return;
          if (decodedText === lastScanRef.current.token && now - lastScanRef.current.time < 3500) {
            return; // Debounce duplicate camera frames
          }
          lastScanRef.current = { token: decodedText, time: now };
          handleValidate(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera scanner initialization error:', err);
      showToast('Camera access unavailable. Use manual Pass ID fallback or simulation.', 'warning');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Camera stop error:', e);
      }
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch (e) {}
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      showToast('Please enter a Pass ID or Student ID.', 'warning');
      return;
    }
    handleValidate(manualInput);
    setManualInput('');
  };

  const simulateScenario = async (type: 'valid' | 'duplicate' | 'unverified' | 'wrong-event' | 'invalid') => {
    if (type === 'valid') {
      try {
        const { getAttendanceList } = await import('@/lib/db');
        const list = await getAttendanceList('NOT_CHECKED_IN', undefined, selectedEventId);
        if (list.length > 0 && list[0].pass_token) {
          handleValidate(list[0].pass_token);
          return;
        }
      } catch (e) {}
      handleValidate('PASS-TN-0492'); // Fallback: Ashutosh Dixit
    } else if (type === 'duplicate') {
      try {
        const { getAttendanceList } = await import('@/lib/db');
        const list = await getAttendanceList('CHECKED_IN', undefined, selectedEventId);
        if (list.length > 0 && list[0].pass_token) {
          handleValidate(list[0].pass_token);
          return;
        }
      } catch (e) {}
      handleValidate('PASS-TN-0488'); // Fallback: Maya Lin (already checked in)
    } else if (type === 'unverified') {
      handleValidate('STU-2024-4491'); // Marcus Vance (PENDING)
    } else if (type === 'wrong-event') {
      handleValidate('PASS-AU-9901'); // Non-matching event
    } else {
      handleValidate('UNKNOWN-QR-9999');
    }
  };

  return (
    <div className="scanner-layout-grid">
      {/* Left Column: Viewport & Triggers */}
      <div>
        <div className="scanner-viewport-box">
          <div id="qr-reader-target" style={{ width: '100%', height: '100%' }}></div>
          {!isCameraActive && <div className="camera-feed-mock"></div>}
          <div className="scan-crosshair">
            <div className="scan-laser-line"></div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--accent-orange)',
              zIndex: 15,
            }}
          >
            <span className="pulse-dot" style={{ display: 'inline-block', marginRight: '6px' }}></span>{' '}
            {isCameraActive ? 'LIVE WEBCAM STREAM // 60 FPS' : 'SCANNER ACTIVE // OPTICAL RETICLE'}
          </div>

          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20 }}>
            {!isCameraActive ? (
              <button className="btn btn-secondary btn-sm" onClick={startCamera}>
                <i className="fa-solid fa-video"></i> Start Camera
              </button>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={stopCamera}>
                <i className="fa-solid fa-video-slash"></i> Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Quick Mock Trigger buttons for Testing Scenarios */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span className="mono-tag" style={{ alignSelf: 'center', color: 'var(--text-muted)', marginRight: '6px' }}>
            Simulate Scan:
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => simulateScenario('valid')}>
            <i className="fa-solid fa-qrcode" style={{ color: 'var(--accent-emerald)' }}></i> Valid Pass (Ashutosh Dixit)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => simulateScenario('duplicate')}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--accent-amber)' }}></i> Duplicate Scan
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => simulateScenario('unverified')}>
            <i className="fa-solid fa-ban" style={{ color: 'var(--accent-rose)' }}></i> Unverified Pass
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => simulateScenario('wrong-event')}>
            <i className="fa-solid fa-shuffle" style={{ color: '#c084fc' }}></i> Wrong Event
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => simulateScenario('invalid')}>
            <i className="fa-solid fa-xmark" style={{ color: 'var(--accent-rose)' }}></i> Invalid QR
          </button>
        </div>

        {/* Manual Pass ID Fallback Input */}
        <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
          <div className="form-label" style={{ marginBottom: '0.5rem' }}>
            MANUAL PASS ID / STUDENT ID INPUT FALLBACK
          </div>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="form-input"
              placeholder="Enter Pass ID e.g. PASS-TN-0492 or 2503840100024..."
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-check"></i> VALIDATE & CHECK-IN
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Scan Result Container */}
      <div>
        <div
          id="scanResultContainer"
          className="glass-panel"
          style={{
            padding: '1.5rem',
            marginBottom: '1.5rem',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {isValidating ? (
            <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', padding: '1rem' }}>
              <i
                className="fa-solid fa-circle-notch fa-spin"
                style={{ fontSize: '38px', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}
              ></i>
              <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                SCANNING &bull; VALIDATING CREDENTIALS...
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Verifying digital cryptographic token, event enrollment, and pass status...
              </div>
            </div>
          ) : !lastResult ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <i
                className="fa-solid fa-qrcode"
                style={{
                  fontSize: '38px',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                  opacity: 0.4,
                }}
              ></i>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Ready to Scan QR Pass</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Align attendee digital pass inside the camera reticle or input Pass ID manually.
              </div>
            </div>
          ) : lastResult.status === 'VALID' ? (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--accent-emerald)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  className="badge badge-verified"
                  style={{ fontSize: '13px', padding: '4px 10px' }}
                >
                  <i className="fa-solid fa-check-double"></i> ✓ ENTRY VERIFIED
                </span>
                <span className="mono-tag" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  CHECKED IN
                </span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                {lastResult.registration?.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Student ID: <strong>{lastResult.registration?.student_id}</strong> &bull; {lastResult.registration?.course}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-orange)', marginTop: '6px', fontWeight: 600 }}>
                <i className="fa-solid fa-calendar-check" style={{ marginRight: '6px' }}></i>
                {lastResult.event?.name || lastResult.registration?.event_name || 'Event Pass Verified'}
              </div>
              <div
                style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                }}
              >
                <span>
                  PASS ID: <strong style={{ color: 'var(--accent-cyan)' }}>{lastResult.registration?.pass_token}</strong>
                </span>
                <span>
                  TIME: <strong>{lastResult.timestamp}</strong>
                </span>
                <span>
                  GATE: <strong>{lastResult.gate}</strong>
                </span>
              </div>
            </div>
          ) : lastResult.status === 'DUPLICATE' ? (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid var(--accent-amber)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  className="badge badge-pending"
                  style={{
                    fontSize: '13px',
                    padding: '4px 10px',
                    color: '#fbbf24',
                    borderColor: '#fbbf24',
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation"></i> ⚠ ALREADY CHECKED IN
                </span>
                <span className="mono-tag" style={{ color: '#fbbf24' }}>
                  DUPLICATE REJECTED
                </span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>
                Pass ID: {lastResult.registration?.pass_token} ({lastResult.registration?.name})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Pass already scanned at <strong>{lastResult.registration?.checkin_time || '09:14 AM'}</strong> by{' '}
                {lastResult.registration?.gate || 'Gate 02'}. Turnstile barrier remains locked.
              </div>
            </div>
          ) : lastResult.status === 'UNVERIFIED' ? (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--accent-rose)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  className="badge badge-rejected"
                  style={{ fontSize: '13px', padding: '4px 10px' }}
                >
                  <i className="fa-solid fa-ban"></i> ✕ REGISTRATION NOT VERIFIED
                </span>
                <span className="mono-tag" style={{ color: '#f87171' }}>
                  ENTRY REFUSED
                </span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>
                {lastResult.registration?.name} ({lastResult.registration?.student_id})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Applicant status is currently <strong>PENDING</strong> review in the admin verification console.
              </div>
            </div>
          ) : lastResult.status === 'WRONG_EVENT' ? (
            <div
              style={{
                background: 'rgba(192, 132, 252, 0.12)',
                border: '1px solid #c084fc',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  className="badge"
                  style={{
                    background: 'rgba(192, 132, 252, 0.2)',
                    color: '#c084fc',
                    border: '1px solid #c084fc',
                    fontSize: '13px',
                    padding: '4px 10px',
                  }}
                >
                  <i className="fa-solid fa-shuffle"></i> ⚠ WRONG EVENT
                </span>
                <span className="mono-tag" style={{ color: '#c084fc' }}>
                  INVALID TARGET
                </span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>
                Pass valid for {lastResult.registration?.event_name || 'Different Schedule'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                This gate is currently validating credentials for selected event schedule.
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--accent-rose)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  className="badge badge-rejected"
                  style={{ fontSize: '13px', padding: '4px 10px' }}
                >
                  <i className="fa-solid fa-xmark"></i> ✕ INVALID PASS
                </span>
                <span className="mono-tag" style={{ color: '#f87171' }}>
                  UNKNOWN CODE
                </span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Unrecognized QR Signature</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Scanned barcode does not exist in the institutional registry database.
              </div>
            </div>
          )}

          {lastResult && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                id="scanNextBtn"
                className="btn btn-primary btn-sm"
                onClick={handleResetScanner}
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}
              >
                <i className="fa-solid fa-arrows-rotate"></i> SCAN NEXT PASS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
