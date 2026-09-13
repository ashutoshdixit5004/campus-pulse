import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function StatusBadge({ status, className = '', style }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  if (normalized === 'VERIFIED' || normalized === 'CHECKED_IN' || normalized === 'CHECKED IN') {
    return (
      <span className={`badge badge-verified ${className}`} style={style}>
        <i className="fa-solid fa-check"></i> {normalized === 'CHECKED_IN' ? 'CHECKED IN' : 'VERIFIED'}
      </span>
    );
  }

  if (normalized === 'PENDING') {
    return (
      <span className={`badge badge-pending ${className}`} style={style}>
        <i className="fa-solid fa-hourglass-half"></i> PENDING
      </span>
    );
  }

  if (normalized === 'REJECTED') {
    return (
      <span className={`badge badge-rejected ${className}`} style={style}>
        <i className="fa-solid fa-xmark"></i> REJECTED
      </span>
    );
  }

  if (normalized === 'LIVE' || normalized === 'OPEN') {
    return (
      <span className={`badge badge-live ${className}`} style={style}>
        <span className="pulse-dot"></span> {normalized}
      </span>
    );
  }

  if (normalized === 'UPCOMING') {
    return (
      <span className={`badge badge-upcoming ${className}`} style={style}>
        UPCOMING
      </span>
    );
  }

  return (
    <span className={`badge badge-completed ${className}`} style={style}>
      {normalized}
    </span>
  );
}
