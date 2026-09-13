'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  isStudentAuthenticated,
  isAdminAuthenticated,
  setStudentSession,
  setAdminSession,
} from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

function SearchParamsReader({
  onParams,
}: {
  onParams: (redirect: string | null, type: string | null) => void;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onParams(searchParams.get('redirect'), searchParams.get('type'));
  }, [searchParams, onParams]);
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [rawRedirect, setRawRedirect] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');

  const handleParams = useCallback((redirect: string | null, type: string | null) => {
    setRawRedirect(redirect);
    if (type === 'admin' || (redirect && redirect.startsWith('/admin'))) {
      setActiveTab('admin');
    } else {
      setActiveTab('student');
    }
  }, []);

  const isEventRedirect = Boolean(rawRedirect && rawRedirect.startsWith('/register'));

  // Student Form State
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentSubmitting, setStudentSubmitting] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Admin Form State
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    if (activeTab === 'student' && isStudentAuthenticated()) {
      const destination = rawRedirect || '/student';
      router.replace(destination);
    } else if (activeTab === 'admin' && isAdminAuthenticated()) {
      const destination = rawRedirect && rawRedirect.startsWith('/admin') ? rawRedirect : '/admin';
      router.replace(destination);
    }
  }, [activeTab, rawRedirect, router]);

  // Handle Student Login
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    if (!studentIdentifier.trim() || !studentPassword.trim()) {
      setStudentError('Please enter both your Student ID / Email and password.');
      return;
    }

    setStudentSubmitting(true);
    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: studentIdentifier.trim(),
          password: studentPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid student credentials.');
      }

      setStudentSession(data.student);
      showToast(`✓ Welcome back, ${data.student.name || data.student.full_name || 'Student'}!`);

      const destination = rawRedirect || '/student';
      router.replace(destination);
    } catch (err: any) {
      setStudentError(err.message || 'Authentication failed. Please verify your credentials.');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setStudentSubmitting(false);
    }
  };

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminIdentifier.trim() || !adminPassword.trim()) {
      setAdminError('Please enter your administrator email/username and password.');
      return;
    }

    setAdminSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: adminIdentifier.trim(),
          password: adminPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator clearance credentials.');
      }

      setAdminSession(data.session);
      showToast(`✓ Operational clearance granted. Welcome, ${data.session.name}!`);

      const destination = rawRedirect && rawRedirect.startsWith('/admin') ? rawRedirect : '/admin';
      router.replace(destination);
    } catch (err: any) {
      setAdminError(err.message || 'Administrative clearance rejected.');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setAdminSubmitting(false);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsReader onParams={handleParams} />
      </Suspense>

      <section className="view-section active" style={{ maxWidth: '560px', margin: '3rem auto' }}>
        {/* Main Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot"></span>
            CAMPUS PULSE &bull; SHEAT COLLEGE
          </div>
          <h1 style={{ fontSize: '36px', letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
            College Event Management System
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            Select your role gateway to access administrative event operations or your personal student passport.
          </p>
        </div>

        {/* Dedicated Event Redirect Banner */}
        {isEventRedirect && (
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
                EVENT REGISTRATION ACCESS
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Authentication required to register for this event. Please log in as a student to proceed directly to the registration form.
              </div>
            </div>
          </div>
        )}

        {/* Role Selection Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            id="tabStudentLogin"
            onClick={() => setActiveTab('student')}
            className={`btn ${activeTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <i className="fa-solid fa-graduation-cap"></i> Student Login
          </button>

          <button
            type="button"
            id="tabAdminLogin"
            onClick={() => setActiveTab('admin')}
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <i className="fa-solid fa-shield-halved"></i> Admin Login
          </button>
        </div>

        {/* Login Panel */}
        <div className="glass-panel" style={{ padding: '2.25rem' }}>
          {/* TAB 1: STUDENT LOGIN */}
          {activeTab === 'student' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '0.25rem' }}>Student Portal Access</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Sign in with your Student ID / Roll Number to view registered events, passes, and certificates.
                </p>
              </div>

              {studentError && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--accent-red)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.25rem',
                    color: '#ffb3b3',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{studentError}</span>
                </div>
              )}

              <form onSubmit={handleStudentLogin}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Student ID / Roll Number or Email *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2503840100024 or student@campus.edu"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={studentSubmitting}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '14px' }}
                >
                  {studentSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> AUTHENTICATING STUDENT...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-right-to-bracket"></i> {isEventRedirect ? 'LOGIN & CONTINUE TO EVENT' : 'SIGN IN AS STUDENT'}
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: 'var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Link
                  href={`/student/signup${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ''}`}
                  style={{ color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                >
                  New Student? Create Account &rarr;
                </Link>

                <Link
                  href={`/admin/login`}
                  style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none' }}
                >
                  Admin Portal &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN LOGIN */}
          {activeTab === 'admin' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '0.25rem' }}>Departmental Administrator Login</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Operational clearance for event directors, student coordinators, and deans.
                </p>
              </div>

              {adminError && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--accent-red)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.25rem',
                    color: '#ffb3b3',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Administrator Identifier *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. vipasha@sheat.edu or admin"
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Security Key / Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={adminSubmitting}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '14px' }}
                >
                  {adminSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> AUTHENTICATING CLEARANCE...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-shield-halved"></i> AUTHENTICATE ADMINISTRATIVE ACCESS
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: 'var(--border-hairline)', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  Protected Administrative Gateway &bull; Session Secured
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
