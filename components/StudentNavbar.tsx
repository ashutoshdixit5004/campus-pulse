'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStudentSession, clearStudentSession, StudentSession } from '@/lib/auth';
import { useToast } from './ToastProvider';

export default function StudentNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [student, setStudent] = useState<StudentSession | null>(null);

  useEffect(() => {
    // Read current student session
    const current = getStudentSession();
    setStudent(current);
  }, [pathname]);

  const handleLogout = () => {
    fetch('/api/student/logout', { method: 'POST' }).catch(() => {});
    clearStudentSession();
    setStudent(null);
    showToast('✓ Student session ended.');
    router.replace('/login');
  };

  const navItems = [
    { label: 'Portal', href: '/student', icon: 'fa-gauge-high' },
    { label: 'Events', href: '/events', icon: 'fa-compass' },
    { label: 'My Events', href: '/my-events', icon: 'fa-calendar-check' },
    { label: 'My Passes', href: '/my-passes', icon: 'fa-ticket' },
    { label: 'Certificates', href: '/certificates', icon: 'fa-award' },
    { label: 'Profile', href: '/profile', icon: 'fa-user-graduate' },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav id="studentNav" className="main-navbar">
      <div className="nav-brand">
        <div className="nav-brand-title">CAMPUS PULSE</div>
        <div className="nav-brand-sub">Student Experience & Passport</div>
      </div>

      <ul className="nav-links">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
              >
                <i className={`fa-solid ${item.icon}`}></i> {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {student ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="nav-profile">
            <div className="nav-profile-info">
              <span className="nav-profile-name">{student.full_name || student.name || 'Student'}</span>
              <span className="nav-profile-role">{student.student_id} // {student.course}</span>
            </div>
            <div className="nav-avatar" style={{ color: 'var(--accent-cyan)' }}>
              {getInitials(student.full_name || student.name || 'Student')}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.6rem', fontSize: '11px' }}
            title="Sign out of student account"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/login" className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
            <i className="fa-solid fa-right-to-bracket"></i> Sign In
          </Link>
          <Link href="/student/signup" className="btn btn-primary btn-sm" style={{ fontSize: '12px' }}>
            <i className="fa-solid fa-user-plus"></i> Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
