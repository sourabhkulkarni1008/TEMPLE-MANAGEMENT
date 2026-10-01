import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { Sparkles, PlusCircle, Trash2, Edit2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const AdminFestivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    specialAnnouncement: '',
    extraStaffAllocated: 25,
    extendedDarshanHours: '04:00 AM - 11:30 PM',
    status: 'ACTIVE'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFestivals = async () => {
    try {
      const res = await api.get('/festivals');
      if (res.success) setFestivals(res.festivals || []);
    } catch (err) {
      console.warn('Failed to load festivals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description: '',
      specialAnnouncement: '',
      extraStaffAllocated: 25,
      extendedDarshanHours: '04:00 AM - 11:30 PM',
      status: 'ACTIVE'
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (f) => {
    setEditingId(f.id);
    setForm({
      name: f.name,
      startDate: f.startDate,
      endDate: f.endDate,
      description: f.description,
      specialAnnouncement: f.specialAnnouncement || '',
      extraStaffAllocated: f.extraStaffAllocated || 25,
      extendedDarshanHours: f.extendedDarshanHours || '04:00 AM - 11:30 PM',
      status: f.status
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
        await api.put(`/festivals/${editingId}`, form);
        setMessage('Festival configuration updated.');
      } else {
        await api.post('/festivals', form);
        setMessage('Festival Mode successfully configured and announced.');
      }
      setShowModal(false);
      fetchFestivals();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete festival ${name}?`)) return;
    try {
      await api.delete(`/festivals/${id}`);
      setMessage('Festival deleted.');
      fetchFestivals();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles color="#b45309" /> Festival Mode &amp; High-Volume Surge Planning
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Configure Brahmotsavam, Shivaratri, and Ekadashi schedules, surges, and extended hours</p>
          </div>
          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} />
            <span>Create Festival Mode</span>
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '580px' }}>
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>{editingId ? 'Edit Festival Schedule' : 'Activate Festival Mode'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Festival Title / Event Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Maha Shivaratri Annual Brahmotsavam"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Extra Staff Allocated</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      value={form.extraStaffAllocated}
                      onChange={(e) => setForm({ ...form, extraStaffAllocated: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Extended Darshan Hours</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={form.extendedDarshanHours}
                      onChange={(e) => setForm({ ...form, extendedDarshanHours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description &amp; Event Scope</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Rituals, chariot procession details, and queue arrangements..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Public Announcement Broadcast Message</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Free prasadam distribution expanded to 8 counters..."
                    value={form.specialAnnouncement}
                    onChange={(e) => setForm({ ...form, specialAnnouncement: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mode Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE (Triggers Surge Protocol)</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : (editingId ? 'Save Changes' : 'Launch Festival Mode')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Festival Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {festivals.map((f) => (
            <div
              key={f.id}
              className="card"
              style={{
                borderColor: f.status === 'ACTIVE' ? '#fde047' : '#e2e8f0',
                background: f.status === 'ACTIVE' ? '#fffdf5' : '#ffffff',
                marginBottom: 0
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: 0 }}>{f.name}</h3>
                    <StatusBadge status={f.status} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                    Active Dates: <strong>{f.startDate}</strong> to <strong>{f.endDate}</strong> &bull; Extended Hours: <strong>{f.extendedDarshanHours}</strong> &bull; Staff Surge: <strong>+{f.extraStaffAllocated} personnel</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleOpenEdit(f)} className="btn btn-secondary btn-sm">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(f.id, f.name)} className="btn btn-danger btn-sm">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0.75rem 0', lineHeight: 1.6 }}>{f.description}</p>

              {f.specialAnnouncement && (
                <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                  <strong>Announcement:</strong> {f.specialAnnouncement}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminFestivals;
