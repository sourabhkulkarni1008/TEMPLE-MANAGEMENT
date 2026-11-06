import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'LOW':
      return (
        <span className="badge badge-low">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          Low Crowd
        </span>
      );
    case 'MODERATE':
      return (
        <span className="badge badge-moderate">
          <span className="pulse-dot" style={{ background: '#f59e0b' }} />
          Moderate Crowd
        </span>
      );
    case 'HIGH':
      return (
        <span className="badge badge-high">
          <span className="pulse-dot" style={{ background: '#ef4444' }} />
          High Crowd
        </span>
      );
    case 'CONFIRMED':
      return (
        <span className="badge badge-confirmed">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          Confirmed Pass
        </span>
      );
    case 'CHECKED_IN':
      return (
        <span className="badge badge-checked-in">
          <span className="pulse-dot" style={{ background: '#2563eb' }} />
          Checked In
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="badge badge-cancelled">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
          Cancelled
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="badge badge-cancelled">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
          Expired
        </span>
      );
    case 'ON_DUTY':
      return (
        <span className="badge badge-confirmed">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          On Duty
        </span>
      );
    case 'OFF_DUTY':
      return (
        <span className="badge badge-cancelled">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
          Off Duty
        </span>
      );
    case 'ACTIVE':
      return (
        <span className="badge badge-confirmed">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          Active
        </span>
      );
    case 'PAUSED':
      return (
        <span className="badge badge-moderate">
          <span className="pulse-dot" style={{ background: '#f59e0b' }} />
          Paused
        </span>
      );
    case 'PENDING':
      return (
        <span className="badge badge-pending">
          <span className="pulse-dot" style={{ background: '#f59e0b' }} />
          Pending
        </span>
      );
    case 'RESPONDING':
      return (
        <span className="badge badge-moderate">
          <span className="pulse-dot" style={{ background: '#f59e0b' }} />
          Responding
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="badge badge-confirmed">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          Resolved
        </span>
      );
    case 'FOUND_IN_CUSTODY':
      return (
        <span className="badge badge-confirmed">
          <span className="pulse-dot" style={{ background: '#10b981' }} />
          Found In Custody
        </span>
      );
    case 'REPORTED':
      return (
        <span className="badge badge-pending">
          <span className="pulse-dot" style={{ background: '#f59e0b' }} />
          Reported
        </span>
      );
    default:
      return (
        <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
          {status}
        </span>
      );
  }
};

export default StatusBadge;
