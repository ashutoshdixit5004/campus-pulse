'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentNavbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: 'fa-house' },
    { label: 'Events', href: '/events', icon: 'fa-compass' },
    { label: 'My Events', href: '/my-events', icon: 'fa-calendar-check' },
    { label: 'My Passes', href: '/my-passes', icon: 'fa-ticket' },
    { label: 'Certificates', href: '/certificates', icon: 'fa-award' },
    { label: 'Profile', href: '/profile', icon: 'fa-user-graduate' },
  ];

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

      <div className="nav-profile">
        <div className="nav-profile-info">
          <span className="nav-profile-name">Alex Chen</span>
          <span className="nav-profile-role">STU-2024-8841 // B.Tech CSE</span>
        </div>
        <div className="nav-avatar" style={{ color: 'var(--accent-cyan)' }}>
          AC
        </div>
      </div>
    </nav>
  );
}
