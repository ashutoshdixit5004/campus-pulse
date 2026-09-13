'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { setAdminSession } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both administrative identifier and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials.');
      }

      setAdminSession(data.session);
      showToast(`✓ Operational clearance granted. Welcome, ${data.session.name}!`);
      router.replace(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication rejected.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="view-section active" style={{ maxWidth: '480px', margin: '3.5rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-shield-halved"></i> SECURE CLEARANCE // ADMIN
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '0.5rem' }}>Administrative Login</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Authorized access to the Campus Pulse College Event Operations Command Center.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2.25rem' }}>
        {errorMessage && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid var(--accent-red)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-red)',
              fontSize: '13px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">ADMINISTRATIVE IDENTIFIER / EMAIL</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. vipasha@sheat.edu or admin"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">COMMAND PASSPHRASE</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter administrative password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 700, fontSize: '14px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> VERIFYING CLEARANCE...
              </>
            ) : (
              <>
                <i className="fa-solid fa-shield-halved"></i> ACCESS ADMIN COMMAND CENTER
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: 'var(--border-hairline)', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Need student access? </span>
          <Link
            href={`/student/login${redirectUrl !== '/admin' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
          >
            Go to Student Login &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Administrative Gateway...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
