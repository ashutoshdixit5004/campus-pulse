'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { setStudentSession } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

function StudentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/student';
  const isEventRegistrationRedirect = redirectUrl.startsWith('/register/');
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter your Student ID or Email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid student credentials.');
      }

      setStudentSession(data.student);
      showToast(`✓ Authentication confirmed. Welcome, ${data.student.name || data.student.full_name || 'Student'}!`);
      // Route immediately to target event registration if came from event link, otherwise to student dashboard
      router.replace(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="view-section active" style={{ maxWidth: '480px', margin: '3.5rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-graduation-cap"></i> STUDENT PASSPORT GATEWAY
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '0.5rem' }}>Student Login</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Access your collegiate event passport, turnstile QR passes, and official certificates.
        </p>
      </div>

      {isEventRegistrationRedirect && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <i className="fa-solid fa-lock" style={{ color: 'var(--accent-orange)', fontSize: '20px' }}></i>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--accent-orange)', fontSize: '13px' }}>
              EVENT REGISTRATION REQUIRED
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Authentication required to register for this event. Please log in with your student credentials to continue to the event form.
            </div>
          </div>
        </div>
      )}

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
            <label className="form-label">STUDENT ID / ROLL NO OR EMAIL</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2503840100024 or your student email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">STUDENT PASSWORD</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your student password"
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
                <i className="fa-solid fa-spinner fa-spin"></i> LOGGING IN...
              </>
            ) : (
              <>
                <i className="fa-solid fa-arrow-right-to-bracket"></i> {isEventRegistrationRedirect ? 'LOGIN & PROCEED TO EVENT' : 'ENTER STUDENT PORTAL'}
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: 'var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Don't have a student account? </span>
            <Link
              href={`/student/signup${redirectUrl !== '/student' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
            >
              Sign Up here &rarr;
            </Link>
          </div>
          <div>
            <Link
              href={`/admin/login`}
              style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none' }}
            >
              Admin Staff? Go to Administrative Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Student Gateway...</div>}>
      <StudentLoginForm />
    </Suspense>
  );
}
