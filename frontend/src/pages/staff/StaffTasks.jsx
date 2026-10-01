import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckSquare, Shield, MapPin, UserCheck } from 'lucide-react';

const StaffTasks = () => {
  const { user } = useAuth();
  const staff = user?.staffProfile || {
    department: 'Entry Management',
    assignedArea: 'Main Entrance & Security Gate',
    shift: 'Morning (06:00 - 14:00)',
    employeeCode: 'EMP-ENT-101'
  };

  const tasks = [
    { title: 'Morning Perimeter Inspection', desc: 'Inspect barricades, turnstiles, and QR scanner devices at Gate 1.', done: true },
    { title: 'Verify Digital Darshan Passes', desc: 'Continuous verification and crowd pacing through primary holding days.', done: true },
    { title: 'Queue Density Monitoring', desc: 'Report any abnormal queue bottleneck exceeding 80% occupancy to Central Control.', done: false },
    { title: 'Handover & Log Reconciliation', desc: 'Reconcile total pilgrim check-in numbers with Evening Shift Supervisor.', done: false }
  ];

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ maxWidth: '750px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>My Shift Roster &amp; Daily Duties</h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Assigned operational tasks and protocol guidelines for your shift</p>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ marginBottom: '1.5rem', background: '#f8fafc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>STAFF NAME &amp; CODE</span>
              <strong>{user?.name} ({staff.employeeCode})</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>DEPARTMENT</span>
              <strong>{staff.department}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>CURRENT SHIFT</span>
              <strong>{staff.shift}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>ASSIGNED ZONE</span>
              <strong>{staff.assignedArea}</strong>
            </div>
          </div>
        </div>

        {/* Duties Checklist */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assigned Operational Checklist</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: t.done ? '#f0fdf4' : '#ffffff'
                }}
              >
                <input
                  type="checkbox"
                  defaultChecked={t.done}
                  style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: t.done ? '#166534' : '#0f172a' }}>{t.title}</div>
                  <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffTasks;
