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
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck color="#b45309" /> Temple Staff Roster &amp; Zone Deployments
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Manage 20+ active marshals, entry scanners, medical assistants, and cleaning staff</p>
          </div>
          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} />
            <span>Add Staff Member</span>
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Modal for Add / Edit */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '520px' }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>{editingId ? 'Edit Staff Assignment' : 'Onboard New Staff Officer'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      disabled={!!editingId}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
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

                  <div className="form-group">
                    <label className="form-label">Shift</label>
                    <select
                      className="form-select"
                      value={form.shift}
                      onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    >
                      <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                      <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                      <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Temple Zone</label>
                  <select
                    className="form-select"
                    value={form.assignedArea}
                    onChange={(e) => setForm({ ...form, assignedArea: e.target.value })}
                  >
                    <option value="Main Entrance & Security Gate">Main Entrance & Security Gate</option>
                    <option value="Queue Complex & Holding Days">Queue Complex & Holding Days</option>
                    <option value="Main Sanctum / Darshan Hall">Main Sanctum / Darshan Hall</option>
                    <option value="Prasadam Distribution Counter">Prasadam Distribution Counter</option>
                    <option value="Exit Corridor & Shoe Stand">Exit Corridor & Shoe Stand</option>
                    <option value="North & South Parking Lot">North & South Parking Lot</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duty Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="ON_DUTY">ON_DUTY</option>
                    <option value="OFF_DUTY">OFF_DUTY</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : (editingId ? 'Save Updates' : 'Add Staff Member')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Staff Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Staff Code</th>
                  <th>Officer Name</th>
                  <th>Department</th>
                  <th>Assigned Zone</th>
                  <th>Shift</th>
                  <th>Duty Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{s.employeeCode}</td>
                    <td>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.email}</div>
                    </td>
                    <td>{s.department}</td>
                    <td>{s.assignedArea}</td>
                    <td style={{ fontSize: '0.8rem' }}>{s.shift}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleOpenEdit(s)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }} title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.name)} className="btn btn-danger btn-sm" style={{ padding: '2px 6px' }} title="Delete">
                          <Trash2 size={13} />
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
