'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { resetDemoState } from '@/lib/db';
import { useToast } from './ToastProvider';

export default function RoleBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const isAdmin = pathname.startsWith('/admin');

  const handleResetDemo = () => {
    resetDemoState();
    showToast('✓ Demo data reset to initial showcase state.');
    router.refresh();
  };

  return (
    <header className="role-bar">
      <div className="role-bar-left">
        <div className="brand-badge">
          <span className="pulse-dot"></span>
          <span>CAMPUS PULSE</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>
            // EVENT OPS OS
          </span>
        </div>

        {/* Role Switcher */}
        <div className="role-switcher">
          <Link
            href="/admin"
            className={`role-btn ${isAdmin ? 'active' : ''}`}
            id="btnRoleAdmin"
          >
            <i className="fa-solid fa-shield-halved"></i> Admin Control Center
          </Link>
          <Link
            href="/"
            className={`role-btn ${!isAdmin ? 'active' : ''}`}
            id="btnRoleStudent"
          >
            <i className="fa-solid fa-graduation-cap"></i> Student Portal
          </Link>
        </div>

        {/* Quick Public Event Link (No Login) */}
        <Link href="/register/technova-2026" className="quick-public-link">
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
          <span>Public Link: /register/technova-2026</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="mono-tag" style={{ color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-bolt" style={{ color: 'var(--accent-orange)' }}></i> Turnstile Active
        </span>
        <button
          className="demo-seed-btn"
          onClick={handleResetDemo}
          title="Reset local data to default demonstration state"
        >
          <i className="fa-solid fa-rotate-right"></i> Reset Demo Data
        </button>
      </div>
    </header>
  );
}
