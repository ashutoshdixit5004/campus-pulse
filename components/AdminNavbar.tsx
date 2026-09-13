'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAdminSession, getAdminSession } from '@/lib/auth';
import { useToast } from './ToastProvider';

interface AdminProfileData {
  name: string;
  email: string;
  title: string;
  phone?: string;
  department?: string;
}

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<AdminProfileData>({
    name: 'Dr. Vipasha',
    email: 'vipasha@sheat.edu',
    title: 'Dean of Student Affairs // Admin',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/admin/me');
      if (res.ok) {
        const data = await res.json();
        if (data.admin) {
          setProfile({
            name: data.admin.name || 'Dr. Vipasha',
            email: data.admin.email || 'vipasha@sheat.edu',
            title: data.admin.title || 'Dean of Student Affairs // Admin',
            phone: data.admin.phone || '',
            department: data.admin.department || '',
          });
        }
      }
    } catch {
      // Fallback to active admin session if available
      const session = getAdminSession();
      if (session) {
        setProfile({
          name: session.name || 'Dr. Vipasha',
          email: session.email || 'vipasha@sheat.edu',
          title: session.title || 'Dean of Student Affairs // Admin',
        });
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, [pathname]);

  const handleOpenEdit = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditTitle(profile.title);
    setEditPhone(profile.phone || '');
    setEditDepartment(profile.department || '');
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!editName.trim() || !editEmail.trim()) {
      setModalError('Name and Institutional Email are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          title: editTitle.trim() || 'Dean of Student Affairs // Admin',
          phone: editPhone.trim(),
          department: editDepartment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile(data.profile);
      showToast('✓ Admin profile updated successfully and persisted!');
      setIsEditModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    clearAdminSession();
    showToast('✓ Admin session terminated.');
    router.replace('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: 'fa-gauge-high' },
    { label: 'Events', href: '/admin/events', icon: 'fa-calendar-days' },
    { label: 'Registrations', href: '/admin/registrations', icon: 'fa-users' },
    { label: 'Verification', href: '/admin/verification', icon: 'fa-user-check' },
    { label: 'Scanner', href: '/admin/scanner', icon: 'fa-qrcode' },
    { label: 'Attendance', href: '/admin/attendance', icon: 'fa-chart-pie' },
    { label: 'Certificates', href: '/admin/certificates', icon: 'fa-award' },
  ];

  const isLoginPage = pathname === '/admin/login';

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <nav id="adminNav" className="main-navbar">
        <div className="nav-brand">
          <div className="nav-brand-title">CAMPUS CONTROL</div>
          <div className="nav-brand-sub">Admin Operational Command Hub</div>
        </div>

        {!isLoginPage && (
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
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            className="nav-profile"
            onClick={handleOpenEdit}
            style={{ cursor: 'pointer' }}
            title="Click to edit administrative profile"
          >
            <div className="nav-profile-info">
              <span className="nav-profile-name">{profile.name}</span>
              <span className="nav-profile-role">{profile.title}</span>
            </div>
            <div className="nav-avatar" style={{ color: 'var(--accent-orange)' }}>
              {getInitials(profile.name)}
            </div>
          </div>

          {!isLoginPage && (
            <>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Edit administrator profile details"
              >
                <i className="fa-solid fa-user-pen"></i> Edit Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem', fontSize: '11px' }}
                title="Sign out of Administrator Command Hub"
              >
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* EDIT ADMIN PROFILE MODAL */}
      {isEditModalOpen && (
        <>
          <div
            className="modal-overlay active"
            onClick={() => setIsEditModalOpen(false)}
            style={{ zIndex: 2500 }}
          />
          <div
            className="modal active"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2600,
              width: '90%',
              maxWidth: '520px',
              background: '#0d131f',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
                  ADMIN SECURITY // CREDENTIALS
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Edit Administrator Profile</h3>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsEditModalOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {modalError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-red)',
                  fontSize: '13px',
                  marginBottom: '1rem',
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Dr. Vipasha"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Institutional Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. vipasha@sheat.edu"
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Used for administrative login authentication.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Official Title / Role Details</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Dean of Student Affairs // Head of Events"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Office Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 542 262 4884"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department / Office</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="Office of Student Affairs"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
