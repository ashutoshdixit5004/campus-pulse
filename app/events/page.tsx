'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents } from '@/lib/db';
import { EventItem } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';

export default function DiscoverEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    getEvents().then((data) => setEvents(data));
  }, []);

  const categories = ['ALL', 'Technical', 'Cultural', 'Robotics', 'Entrepreneurship'];

  const filteredEvents = events.filter((ev) => {
    const matchCat = activeCategory === 'ALL' || ev.category === activeCategory;
    const matchSearch =
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section className="view-section active">
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono-tag" style={{ color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>
          CAMPUS DISCOVERY // ALL SESSIONS
        </div>
        <h1 style={{ fontSize: '38px' }}>Discover Flagship Events</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Browse open hackathons, symposiums, robotics arenas, and cultural festivals. Zero-login direct student registration.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-secondary btn-sm ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'var(--accent-orange)' : undefined,
                color: activeCategory === cat ? 'var(--text-inverse)' : undefined,
                fontWeight: activeCategory === cat ? 700 : undefined,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Search events, tracks, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '280px', padding: '0.5rem 0.85rem' }}
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '36px', color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.4, display: 'block' }}></i>
          <h3 style={{ fontSize: '18px', marginBottom: '0.5rem' }}>No Events Match Your Filter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Try selecting a different category or clearing your search term.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {filteredEvents.map((ev) => {
          const isFull = (ev.registered_count || 0) >= ev.capacity;
          const isClosed = ev.status === 'CLOSED';

          return (
            <div
              key={ev.id}
              className="glass-panel"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span className="mono-tag" style={{ color: 'var(--accent-cyan)' }}>
                    {ev.category}
                  </span>
                  <StatusBadge status={ev.event_status} />
                </div>

                <h3 style={{ fontSize: '20px', marginBottom: '0.5rem' }}>{ev.name}</h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    lineHeight: 1.5,
                  }}
                >
                  {ev.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <i className="fa-regular fa-calendar" style={{ width: '18px' }}></i> {ev.date} &bull; {ev.start_time} - {ev.end_time}
                  </div>
                  <div>
                    <i className="fa-solid fa-location-dot" style={{ width: '18px' }}></i> {ev.venue}
                  </div>
                  <div>
                    <i className="fa-solid fa-users" style={{ width: '18px' }}></i> Capacity: {ev.registered_count || 0} / {ev.capacity} seats
                  </div>
                </div>
              </div>

              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: 'var(--border-hairline)',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <Link
                  href={`/events/${ev.slug}`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <i className="fa-solid fa-circle-info"></i> DETAILS
                </Link>

                {isClosed || isFull ? (
                  <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5, flex: 1 }}>
                    CLOSED
                  </button>
                ) : (
                  <Link
                    href={`/register/${ev.slug}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <i className="fa-solid fa-paper-plane"></i> REGISTER
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </section>
  );
}
