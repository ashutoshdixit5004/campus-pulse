'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isStudentAuthenticated, setStudentSession } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

function StudentSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/student';
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('B.Tech CSE');
  const [branch, setBranch] = useState<'B.Tech CSE - Babatpur' | 'B.Tech CSE - Gahani' | ''>('');
  const [college] = useState('SHEAT College of Engineering');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isStudentAuthenticated()) {
      router.replace(redirectUrl);
    }
  }, [redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !studentId.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all mandatory student credentials.');
      return;
    }

    if (!branch) {
      setErrorMessage('Please select your campus branch (Babatpur or Gahani).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          name: fullName.trim(),
          student_id: studentId.trim(),
          email: email.trim(),
          course: course.trim(),
          college: 'SHEAT College of Engineering',
          branch,
          phone: phone.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create student account.');
      }

      setStudentSession(data.student);
      showToast(`✓ Account created! Welcome, ${data.student.name || data.student.full_name || 'Student'}!`);
      router.replace(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Signup failed.');
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="view-section active" style={{ maxWidth: '640px', margin: '2.5rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-id-card"></i> NEW STUDENT ENROLLMENT
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '0.5rem' }}>Create Student Account</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Register your institutional student profile to receive dedicated QR entry passes, personalized evaluation marks, and accredited certificates.
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">FULL LEGAL NAME *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">STUDENT ID / ROLL NO *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2503840100099"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">STUDENT EMAIL *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. priya.sharma@sheat.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">PHONE NUMBER</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">COLLEGE / INSTITUTION (FIXED)</label>
              <input
                type="text"
                className="form-input"
                value={college}
                readOnly
                disabled
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-secondary)',
                  cursor: 'not-allowed',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Official institution locked to SHEAT College of Engineering.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">CAMPUS BRANCH *</label>
              <select
                className="form-select"
                value={branch}
                onChange={(e) => setBranch(e.target.value as any)}
                required
                style={{ borderColor: !branch ? 'var(--accent-orange)' : undefined }}
              >
                <option value="">Select Campus Branch...</option>
                <option value="B.Tech CSE - Babatpur">Babatpur</option>
                <option value="B.Tech CSE - Gahani">Gahani</option>
              </select>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Select your assigned SHEAT campus branch.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">COURSE / PROGRAM *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.Tech CSE"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ACCOUNT PASSWORD *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Choose a student password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 700, fontSize: '14px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> ENROLLING ACCOUNT...
              </>
            ) : (
              <>
                <i className="fa-solid fa-user-plus"></i> CREATE ACCOUNT & ENTER PORTAL
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: 'var(--border-hairline)', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Already registered? </span>
          <Link
            href={`/student/login${redirectUrl !== '/student' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            style={{ color: 'var(--accent-orange)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
          >
            Sign in to your account &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function StudentSignupPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Registration Portal...</div>}>
      <StudentSignupForm />
    </Suspense>
  );
}
