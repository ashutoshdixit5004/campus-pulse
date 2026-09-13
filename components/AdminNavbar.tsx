'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: 'fa-gauge-high' },
    { label: 'Events', href: '/admin/events', icon: 'fa-calendar-days' },
    { label: 'Registrations', href: '/admin/registrations', icon: 'fa-users' },
    { label: 'Verification', href: '/admin/verification', icon: 'fa-user-check' },
    { label: 'Scanner', href: '/admin/scanner', icon: 'fa-qrcode' },
    { label: 'Attendance', href: '/admin/attendance', icon: 'fa-chart-pie' },
    { label: 'Certificates', href: '/admin/certificates', icon: 'fa-award' },
  ];

  return (
    <nav id="adminNav" className="main-navbar">
      <div className="nav-brand">
        <div className="nav-brand-title">CAMPUS CONTROL</div>
        <div className="nav-brand-sub">Admin Operational Command Hub</div>
      </div>

      <ul className="nav-links">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
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
          <span className="nav-profile-name">Dr. Aris Thorne</span>
          <span className="nav-profile-role">Dean of Student Affairs // Admin</span>
        </div>
        <div className="nav-avatar">AT</div>
      </div>
    </nav>
  );
}
