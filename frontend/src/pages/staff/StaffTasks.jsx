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
      <div className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ 
              display: 'inline-flex', 
              background: 'rgba(217, 119, 6, 0.15)', 
              color: '#d97706', 
              padding: '8px', 
              borderRadius: '50%',
              border: '1px solid rgba(217, 119, 6, 0.3)'
            }}>
              <CheckSquare size={24} />
            </span>
            <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
              Staff Shift Roster &amp; Operational Duties
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Mandatory operational protocols, gate checkpoint checklists, and safety procedures assigned to your duty post.
          </p>
        </div>

        {/* Profile Card */}
        <div className="card card-gold-trim glass-card" style={{ marginBottom: '1.75rem', padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                STAFF OFFICER &amp; ID
              </span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{user?.name || 'Gate Officer'}</strong>
              <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>{staff.employeeCode}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                DEPARTMENT
              </span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{staff.department}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                ACTIVE SHIFT
              </span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{staff.shift}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                ASSIGNED SECTOR
              </span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{staff.assignedArea}</strong>
            </div>
          </div>
        </div>

        {/* Duties Checklist */}
        <div className="card glass-card" style={{ borderRadius: '16px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Duty Completion Checklist
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700, background: '#f0fdf4', padding: '4px 10px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
              2 of 4 Completed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  border: t.done ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(226, 232, 240, 0.9)',
                  background: t.done ? 'rgba(240, 253, 244, 0.7)' : 'rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="checkbox"
                  defaultChecked={t.done}
                  style={{ marginTop: '3px', cursor: 'pointer', width: '18px', height: '18px', accentColor: '#d97706' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: t.done ? '#166534' : '#0f172a', textDecoration: t.done ? 'line-through' : 'none' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
                    {t.desc}
                  </div>
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
