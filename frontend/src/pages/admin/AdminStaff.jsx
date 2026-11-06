import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { UserCheck, PlusCircle, Trash2, Edit2, Search, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const AdminStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Entry Management',
    assignedArea: 'Main Entrance & Security Gate',
    shift: 'Morning (06:00 - 14:00)',
    status: 'ON_DUTY'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff');
      if (res.success) setStaffList(res.staff || []);
    } catch (err) {
      console.warn('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      department: 'Entry Management',
      assignedArea: 'Main Entrance & Security Gate',
      shift: 'Morning (06:00 - 14:00)',
      status: 'ON_DUTY'
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone,
      department: s.department,
      assignedArea: s.assignedArea,
      shift: s.shift,
      status: s.status
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      if (editingId) {
        await api.put(`/staff/${editingId}`, form);
        setMessage('Staff profile updated successfully.');
      } else {
        await api.post('/staff', form);
        setMessage('New staff officer onboarded successfully.');
      }
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Staff operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove staff member ${name}?`)) return;
    try {
      await api.delete(`/staff/${id}`);
      setMessage('Staff member removed.');
      fetchStaff();
    } catch (err) {
      alert(err.message || 'Failed to remove staff.');
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ 
                display: 'inline-flex', 
                background: 'rgba(217, 119, 6, 0.15)', 
                color: '#d97706', 
                padding: '8px', 
                borderRadius: '50%',
                border: '1px solid rgba(217, 119, 6, 0.3)'
              }}>
                <UserCheck size={24} />
              </span>
              <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                Temple Staff Roster &amp; Zone Deployments
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Oversee security marshals, gate QR scanners, medical assistants, and ground sanitation personnel.
            </p>
          </div>
          <button 
            onClick={handleOpenAdd} 
            className="btn btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
            }}
          >
            <PlusCircle size={18} />
            <span>Onboard Staff Officer</span>
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
          </div>
        )}

        {/* Modal for Add / Edit */}
        {showModal && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.65)' }}>
            <div className="modal-content glass-card card-gold-trim" style={{ padding: 0, borderRadius: '16px', maxWidth: '540px', overflow: 'hidden' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: '#ffffff', 
                padding: '1.25rem 1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '2px solid rgba(245, 158, 11, 0.4)'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={20} style={{ color: '#f59e0b' }} /> {editingId ? 'Edit Staff Assignment' : 'Onboard New Staff Officer'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)} 
                  aria-label="Close dialog"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '1.4rem', 
                    color: '#94a3b8', 
                    cursor: 'pointer',
                    padding: '2px 8px',
                    lineHeight: 1
                  }}
                >
                  &times;
                </button>
              </div>

              <div style={{ padding: '1.75rem 1.5rem' }}>
                {error && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        required
                        disabled={!!editingId}
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mobile Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Department</label>
                      <select
                        className="form-select"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="Entry Management">Entry Management</option>
                        <option value="Queue Management">Queue Management</option>
                        <option value="Security">Security</option>
                        <option value="Help Desk">Help Desk</option>
                        <option value="Medical Assistance">Medical Assistance</option>
                        <option value="Cleaning & Sanitation">Cleaning & Sanitation</option>
                        <option value="Prasadam Management">Prasadam Management</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Shift</label>
                      <select
                        className="form-select"
                        value={form.shift}
                        onChange={(e) => setForm({ ...form, shift: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                        <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                        <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Assigned Temple Zone</label>
                    <select
                      className="form-select"
                      value={form.assignedArea}
                      onChange={(e) => setForm({ ...form, assignedArea: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="Main Entrance & Security Gate">Main Entrance & Security Gate</option>
                      <option value="Queue Complex & Holding Days">Queue Complex & Holding Days</option>
                      <option value="Main Sanctum / Darshan Hall">Main Sanctum / Darshan Hall</option>
                      <option value="Prasadam Distribution Counter">Prasadam Distribution Counter</option>
                      <option value="Exit Corridor & Shoe Stand">Exit Corridor & Shoe Stand</option>
                      <option value="North & South Parking Lot">North & South Parking Lot</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Duty Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="ON_DUTY">ON_DUTY</option>
                      <option value="OFF_DUTY">OFF_DUTY</option>
                      <option value="ON_LEAVE">ON_LEAVE</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)} 
                      className="btn btn-secondary"
                      style={{ borderRadius: '8px', padding: '0.65rem 1.25rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={actionLoading}
                      style={{ borderRadius: '8px', padding: '0.65rem 1.25rem', fontWeight: 700 }}
                    >
                      {actionLoading ? 'Saving...' : (editingId ? 'Save Updates' : 'Add Staff Member')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Staff Table */}
        <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
          <div className="table-container" style={{ border: 'none', margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.25rem' }}>Staff Code</th>
                  <th>Officer Name</th>
                  <th>Department</th>
                  <th>Assigned Zone</th>
                  <th>Shift</th>
                  <th>Duty Status</th>
                  <th style={{ paddingRight: '1.25rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#b45309', paddingLeft: '1.25rem' }}>{s.employeeCode}</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{s.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.email}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, background: 'rgba(241, 245, 249, 0.9)', padding: '2px 8px', borderRadius: '6px' }}>
                        {s.department}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{s.assignedArea}</td>
                    <td style={{ fontSize: '0.825rem', color: '#475569' }}>{s.shift}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ paddingRight: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleOpenEdit(s)} 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '4px 8px', borderRadius: '6px' }} 
                          title="Edit Staff Member"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id, s.name)} 
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '4px 8px', borderRadius: '6px' }} 
                          title="Delete Staff Member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStaff;
