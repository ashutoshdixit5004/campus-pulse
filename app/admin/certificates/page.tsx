'use client';

import React, { useEffect, useState } from 'react';
import CertificateModal from '@/components/CertificateModal';
import { getEvents, getAttendanceList, getCertificates, issueCertificatesForEvent } from '@/lib/db';
import { EventItem, RegistrationItem, CertificateItem } from '@/types/database';
import { useToast } from '@/components/ToastProvider';

export default function AdminCertificatesPage() {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<RegistrationItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    const [evs, certs] = await Promise.all([getEvents(), getCertificates()]);
    setEvents(evs);
    setCertificates(certs);
    if (evs.length > 0 && !selectedEventId) {
      setSelectedEventId(evs[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      getAttendanceList('CHECKED_IN', undefined, selectedEventId).then((list) => {
        setAttendees(list);
      });
    }
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const issuedForEvent = certificates.filter((c) => c.event_id === selectedEvent?.id || c.event_id === selectedEvent?.slug);
  const issuedRegIds = new Set(issuedForEvent.map((c) => c.registration_id));
  const pendingDispatchCount = attendees.filter((a) => !issuedRegIds.has(a.id)).length;

  const handleBatchDispatch = async () => {
    if (!selectedEvent) return;
    setIsDispatching(true);
    try {
      const count = await issueCertificatesForEvent(selectedEvent.id);
      showToast(`✓ ${count} Certificates dispatched to verified attendee profiles.`);
      await loadData();
    } catch (err: any) {
      showToast('Error issuing certificates.', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          ACADEMIC RECOGNITION // VERIFIED CREDENTIALS
        </div>
        <h1 style={{ fontSize: '36px' }}>Certificates Issuance Hub</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Tamper-proof participation certificates batch-issued strictly to verified turnstile attendees.
        </p>
      </div>

      {/* Event Selection & Dispatch Panel */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div className="form-label" style={{ marginBottom: '0.5rem' }}>SELECT TARGET EVENT</div>
            <select
              className="form-select"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ minWidth: '280px' }}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleBatchDispatch}
            disabled={isDispatching || attendees.length === 0}
          >
            <i className="fa-solid fa-paper-plane"></i>{' '}
            {isDispatching
              ? 'DISPATCHING...'
              : `DISPATCH ${pendingDispatchCount} PENDING CERTIFICATES`}
          </button>
        </div>

        {/* Stats Strip */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-label">Confirmed Attendees</div>
            <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{attendees.length}</div>
            <div className="stat-sub">Turnstile verified</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Certificates Issued</div>
            <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{issuedForEvent.length}</div>
            <div className="stat-sub">Dispatched to dossier</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Issuance</div>
            <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{pendingDispatchCount}</div>
            <div className="stat-sub">Ready for dispatch</div>
          </div>
        </div>

        <div
          style={{
            padding: '1.5rem',
            background: '#0c0e15',
            border: 'var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                background: 'rgba(255, 87, 34, 0.12)',
                border: '1px solid var(--accent-orange)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="fa-solid fa-award" style={{ fontSize: '24px', color: 'var(--accent-orange)' }}></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>
                Official Certificate of Merit & Participation
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Signed by: Dean of Student Affairs & Collegiate Faculty Head
              </div>
              <div className="mono-tag" style={{ color: 'var(--accent-cyan)', marginTop: '4px' }}>
                STATUS: {pendingDispatchCount > 0 ? `${pendingDispatchCount} AWAITING BATCH DISPATCH` : 'ALL ATTENDEES DISPATCHED'}
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCertModalOpen(true)}
          >
            <i className="fa-solid fa-eye"></i> Preview Template
          </button>
        </div>
      </div>

      {/* Issued Certificates Registry */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '1rem' }}>
          Issued Certificates Registry ({certificates.length} Total Issued)
        </h3>

        {certificates.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CERTIFICATE NUMBER</th>
                  <th>RECIPIENT STUDENT</th>
                  <th>EVENT</th>
                  <th>ROLE</th>
                  <th>ISSUED AT</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="mono-tag" style={{ color: 'var(--accent-cyan)' }}>
                        {c.certificate_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.student_name}</div>
                    </td>
                    <td>{c.event_name}</td>
                    <td>
                      <span className="badge badge-verified">{c.role}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(c.issued_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            No certificates have been issued yet. Click &quot;Dispatch Certificates&quot; to issue certificates to turnstile attendees.
          </p>
        )}
      </div>

      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        eventTitle={selectedEvent?.name || 'Campus Event'}
        studentName="Student"
        role="Verified Attendee"
        date={selectedEvent?.date || new Date().toISOString().split('T')[0]}
        authCode={`CERT-2026-ST-${Date.now().toString().slice(-6)}`}
      />
    </section>
  );
}
