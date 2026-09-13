'use client';

import React from 'react';

export default function RoleBar() {
  return (
    <header className="role-bar">
      <div className="role-bar-left">
        <div className="brand-badge">
          <span className="pulse-dot"></span>
          <span>CAMPUS PULSE</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>
            // SHEAT COLLEGE EVENT MANAGEMENT OPS
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-cyan)', marginRight: '6px' }}></i>
          Institutional Gateway Active
        </span>
        <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-bolt" style={{ color: 'var(--accent-orange)', marginRight: '6px' }}></i>
          Turnstile QR Verification Online
        </span>
      </div>
    </header>
  );
}
