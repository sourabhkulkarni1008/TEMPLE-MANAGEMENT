import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'LOW':
      return <span className="badge badge-low">Low Crowd</span>;
    case 'MODERATE':
      return <span className="badge badge-moderate">Moderate Crowd</span>;
    case 'HIGH':
      return <span className="badge badge-high">High Crowd</span>;
    case 'CONFIRMED':
      return <span className="badge badge-confirmed">&check; Confirmed</span>;
    case 'CHECKED_IN':
      return <span className="badge badge-checked-in">&bull; Checked In</span>;
    case 'CANCELLED':
      return <span className="badge badge-cancelled">&times; Cancelled</span>;
    case 'EXPIRED':
      return <span className="badge badge-cancelled">Expired</span>;
    case 'ON_DUTY':
      return <span className="badge badge-confirmed">On Duty</span>;
    case 'OFF_DUTY':
      return <span className="badge badge-cancelled">Off Duty</span>;
    case 'ACTIVE':
      return <span className="badge badge-confirmed">Active</span>;
    case 'PAUSED':
      return <span className="badge badge-moderate">Paused</span>;
    case 'PENDING':
      return <span className="badge badge-pending">Pending</span>;
    case 'RESPONDING':
      return <span className="badge badge-moderate">Responding</span>;
    case 'RESOLVED':
      return <span className="badge badge-confirmed">Resolved</span>;
    case 'FOUND_IN_CUSTODY':
      return <span className="badge badge-confirmed">Found In Custody</span>;
    case 'REPORTED':
      return <span className="badge badge-pending">Reported</span>;
    default:
      return <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{status}</span>;
  }
};

export default StatusBadge;
