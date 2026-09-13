'use client';

import React, { useState } from 'react';
import { RegistrationItem } from '@/types/database';
import StatusBadge from './StatusBadge';

interface VerificationDrawerProps {
  registration: RegistrationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (regId: string) => void;
  onReject: (regId: string, reason: string) => void;
  initialShowReject?: boolean;
}

export default function VerificationDrawer({
  registration,
  isOpen,
  onClose,
  onVerify,
  onReject,
  initialShowReject = false,
}: VerificationDrawerProps) {
  const [showRejectField, setShowRejectField] = useState(initialShowReject);
  const [rejectionReason, setRejectionReason] = useState('ID card scan unreadable or blurry');

  if (!registration) return null;

  const handleVerify = () => {
    onVerify(registration.id);
    onClose();
  };

  const handleRejectClick = () => {
    if (!showRejectField) {
      setShowRejectField(true);
    } else {
      onReject(registration.id, rejectionReason);
      setShowRejectField(false);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="modal-overlay active"
          onClick={onClose}
          style={{ zIndex: 2050 }}
        />
      )}

      <aside className={`drawer ${isOpen ? 'open' : ''}`} style={{ zIndex: 2100 }}>
        <div
          style={{
            padding: '1.5rem',
            borderBottom: 'var(--border-hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="mono-tag" style={{ color: 'var(--accent-orange)' }}>
              REGISTRATION AUDIT
            </div>
            <h3 style={{ fontSize: '18px' }}>{registration.name}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <StatusBadge status={registration.status} />
            <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
              {new Date(registration.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div className="form-label">STUDENT ID / ROLL NO</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {registration.student_id}
              </div>
            </div>
            <div>
              <div className="form-label">COLLEGE</div>
              <div style={{ fontWeight: 600 }}>{registration.college}</div>
            </div>
            <div>
              <div className="form-label">COURSE & SEMESTER</div>
              <div style={{ fontWeight: 600 }}>
                {registration.course} &bull; {registration.semester}
              </div>
            </div>
            <div>
              <div className="form-label">CONTACT INFORMATION</div>
              <div style={{ fontSize: '13px' }}>
                {registration.email} &bull; {registration.phone}
              </div>
            </div>
            <div>
              <div className="form-label">TARGET EVENT</div>
              <div style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>
                {registration.event_name || 'Technova 2026 // 48-Hr Hackathon'}
              </div>
            </div>
            {registration.pass_token && (
              <div>
                <div className="form-label">DIGITAL PASS TOKEN</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {registration.pass_token}
                </div>
              </div>
            )}
            {registration.rejection_reason && (
              <div>
                <div className="form-label" style={{ color: 'var(--accent-rose)' }}>REJECTION REASON</div>
                <div style={{ color: 'var(--accent-rose)', fontSize: '13px' }}>
                  {registration.rejection_reason}
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Document Preview */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="form-label" style={{ marginBottom: '0.5rem' }}>
              UPLOADED CREDENTIAL SCAN
            </div>
            <div
              style={{
                border: 'var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                background: '#0c0e15',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '160px',
                  background: '#1a1e2b',
                  border: '1px dashed #343c52',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <i
                  className="fa-solid fa-id-badge"
                  style={{ fontSize: '32px', color: 'var(--accent-orange)' }}
                ></i>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>
                  OFFICIAL INSTITUTIONAL STUDENT ID
                </span>
                <span className="mono-tag" style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>
                  {registration.document_url || 'VERIFIED APEX STU EMBEDDED CHIP'}
                </span>
              </div>
            </div>
          </div>

          {/* Rejection Reason Input */}
          {showRejectField && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ color: 'var(--accent-rose)' }}>
                REJECTION REASON (STUDENT WILL BE NOTIFIED)
              </label>
              <select
                className="form-select"
                style={{ width: '100%', marginTop: '4px' }}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <option value="ID card scan unreadable or blurry">
                  ID card scan unreadable or blurry
                </option>
                <option value="Ineligible department / Non-STEM program">
                  Ineligible department / Non-STEM program
                </option>
                <option value="Duplicate registration submission detected">
                  Duplicate registration submission detected
                </option>
                <option value="Event capacity has reached maximum threshold">
                  Event capacity has reached maximum threshold
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Drawer Actions */}
        <div
          style={{
            padding: '1.25rem',
            borderTop: 'var(--border-hairline)',
            display: 'flex',
            gap: '0.75rem',
            background: '#141722',
          }}
        >
          {registration.status === 'PENDING' && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleVerify}>
              <i className="fa-solid fa-check"></i> VERIFY REGISTRATION
            </button>
          )}
          {registration.status !== 'REJECTED' && (
            <button
              className="btn btn-secondary"
              style={{
                flex: 1,
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#f87171',
              }}
              onClick={handleRejectClick}
            >
              <i className="fa-solid fa-ban"></i> {showRejectField ? 'CONFIRM REJECT' : 'REJECT'}
            </button>
          )}
          {registration.status === 'VERIFIED' && (
            <span
              className="badge badge-verified"
              style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
            >
              <i className="fa-solid fa-check-double"></i> PASS ACTIVE
            </span>
          )}
        </div>
      </aside>
    </>
  );
}
