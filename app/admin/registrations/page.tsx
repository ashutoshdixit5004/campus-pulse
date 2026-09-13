'use client';

import React, { useEffect, useState } from 'react';
import { getRegistrations, getEvents, verifyRegistration, rejectRegistration } from '@/lib/db';
import { RegistrationItem, EventItem } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import VerificationDrawer from '@/components/VerificationDrawer';
import { useToast } from '@/components/ToastProvider';

interface AdminRegistrationsPageProps {
  initialFilter?: 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function AdminRegistrationsPage({
  initialFilter = 'ALL',
  pageTitle = 'Registrations & Verification',
  pageSubtitle = 'Review submitted student credentials, approve verified candidates, or reject with reason.',
}: AdminRegistrationsPageProps) {
  const [allRegistrations, setAllRegistrations] = useState<RegistrationItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerReg, setDrawerReg] = useState<RegistrationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showRejectFirst, setShowRejectFirst] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    const [allRegs, regs, evs] = await Promise.all([
      getRegistrations('ALL', selectedEventId),
      getRegistrations(activeFilter, selectedEventId, searchQuery),
      getEvents(),
    ]);
    setAllRegistrations(allRegs);
    setRegistrations(regs);
    setEvents(evs);
  };

  useEffect(() => {
    loadData();
  }, [activeFilter, selectedEventId, searchQuery]);

  const handleQuickVerify = async (regId: string) => {
    const updated = await verifyRegistration(regId);
    if (updated) {
      showToast(`✓ Verified ${updated.name}! Digital pass ${updated.pass_token} generated.`);
      loadData();
    }
  };

  const handleDrawerVerify = async (regId: string) => {
    const updated = await verifyRegistration(regId);
    if (updated) {
      showToast(`✓ Registration Verified! Digital QR Pass Generated for ${updated.name} (${updated.pass_token})`);
      loadData();
    }
  };

  const handleDrawerReject = async (regId: string, reason: string) => {
    const updated = await rejectRegistration(regId, reason);
    if (updated) {
      showToast(`✕ Registration Rejected: ${reason}`);
      loadData();
    }
  };

  const openDrawer = (reg: RegistrationItem, showReject: boolean = false) => {
    setDrawerReg(reg);
    setShowRejectFirst(showReject);
    setIsDrawerOpen(true);
  };

  // Real Counts across entire dataset
  const totalCount = allRegistrations.length;
  const pendingCount = allRegistrations.filter((r) => r.status === 'PENDING').length;
  const verifiedCount = allRegistrations.filter((r) => r.status === 'VERIFIED').length;
  const rejectedCount = allRegistrations.filter((r) => r.status === 'REJECTED').length;

  return (
    <section className="view-section active">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
            ADMIN OPS // CANDIDATE VERIFICATION
          </div>
          <h1 style={{ fontSize: '36px' }}>{pageTitle}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {pageSubtitle}
          </p>
        </div>
        <div>
          <select
            id="regEventFilterSelect"
            className="form-select"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ background: '#181b24', width: '240px' }}
          >
            <option value="ALL">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Controls & Filter Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} id="regStatusFilters">
          <button
            className={`btn btn-secondary btn-sm ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            ALL (<span id="countAllReg">{totalCount}</span>)
          </button>
          <button
            className={`btn btn-secondary btn-sm ${activeFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PENDING')}
          >
            PENDING (<span id="countPendingReg">{pendingCount}</span>)
          </button>
          <button
            className={`btn btn-secondary btn-sm ${activeFilter === 'VERIFIED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('VERIFIED')}
          >
            VERIFIED (<span id="countVerifiedReg">{verifiedCount}</span>)
          </button>
          <button
            className={`btn btn-secondary btn-sm ${activeFilter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('REJECTED')}
          >
            REJECTED (<span id="countRejectedReg">{rejectedCount}</span>)
          </button>
        </div>

        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Search student name / ID / email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '280px', padding: '0.45rem 0.75rem', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="table-container">
          <table className="pulse-table" id="registrationsTable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Event</th>
                <th>Course</th>
                <th>Registration Date</th>
                <th>Document</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody id="registrationsTableBody">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', marginBottom: '0.75rem', opacity: 0.5, display: 'block' }}></i>
                    <div>No student registrations found matching the current filter.</div>
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div className="table-title">{reg.name}</div>
                      <div className="table-subtitle">{reg.college || 'Apex Institute'}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{reg.student_id}</td>
                    <td style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: 600 }}>
                      {reg.event_name || 'Technova 2026'}
                    </td>
                    <td>{reg.course}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(reg.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openDrawer(reg, false)}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        title="Audit uploaded ID scan"
                      >
                        <i className="fa-solid fa-file-lines" style={{ color: 'var(--accent-cyan)', marginRight: '4px' }}></i> ID SCAN
                      </button>
                    </td>
                    <td>
                      <StatusBadge status={reg.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openDrawer(reg, false)}
                          title="View complete application"
                        >
                          <i className="fa-solid fa-id-card"></i> VIEW
                        </button>

                        {reg.status === 'PENDING' && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleQuickVerify(reg.id)}
                              title="Approve candidate and generate QR pass"
                            >
                              <i className="fa-solid fa-check"></i> APPROVE
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#f87171' }}
                              onClick={() => openDrawer(reg, true)}
                              title="Reject registration with reason"
                            >
                              <i className="fa-solid fa-xmark"></i> REJECT
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VerificationDrawer
        registration={drawerReg}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onVerify={handleDrawerVerify}
        onReject={handleDrawerReject}
        initialShowReject={showRejectFirst}
      />
    </section>
  );
}
