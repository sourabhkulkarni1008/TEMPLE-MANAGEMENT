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
                <Sparkles size={24} />
              </span>
              <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                Festival Mode &amp; High-Volume Surge Planning
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Govern Brahmotsavam, Shivaratri, and Ekadashi schedules, queue surge extensions, and extra personnel deployments.
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
            <span>Create Festival Mode</span>
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.65)' }}>
            <div className="modal-content glass-card card-gold-trim" style={{ padding: 0, borderRadius: '16px', maxWidth: '580px', overflow: 'hidden' }}>
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
                  <Sparkles size={20} style={{ color: '#f59e0b' }} /> {editingId ? 'Edit Festival Schedule' : 'Activate Festival Mode'}
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
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Festival Title / Event Name</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Maha Shivaratri Annual Brahmotsavam"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Start Date</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>End Date</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Extra Staff Allocated</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        value={form.extraStaffAllocated}
                        onChange={(e) => setForm({ ...form, extraStaffAllocated: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Extended Darshan Hours</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={form.extendedDarshanHours}
                        onChange={(e) => setForm({ ...form, extendedDarshanHours: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Description &amp; Event Scope</label>
                    <textarea
                      className="form-textarea"
                      required
                      placeholder="Rituals, chariot procession details, and queue arrangements..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      style={{ borderRadius: '8px', minHeight: '80px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Public Announcement Broadcast Message</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Free prasadam distribution expanded to 8 counters..."
                      value={form.specialAnnouncement}
                      onChange={(e) => setForm({ ...form, specialAnnouncement: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mode Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="ACTIVE">ACTIVE (Triggers Surge Protocol)</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="COMPLETED">COMPLETED</option>
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
                      {actionLoading ? 'Saving...' : (editingId ? 'Save Changes' : 'Launch Festival Mode')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Festival Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {festivals.map((f) => (
            <div
              key={f.id}
              className={`card glass-card ${f.status === 'ACTIVE' ? 'card-gold-trim' : ''}`}
              style={{
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: f.status === 'ACTIVE' ? '0 8px 25px rgba(245, 158, 11, 0.12)' : undefined,
                marginBottom: 0
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{f.name}</h3>
                    <StatusBadge status={f.status} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                    Active Dates: <strong>{f.startDate}</strong> to <strong>{f.endDate}</strong> &bull; Extended Hours: <strong style={{ color: '#d97706' }}>{f.extendedDarshanHours}</strong> &bull; Staff Surge: <strong>+{f.extraStaffAllocated} officers</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleOpenEdit(f)} 
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(f.id, f.name)} 
                    className="btn btn-danger btn-sm"
                    style={{ borderRadius: '6px', padding: '4px 8px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#334155', margin: '0.85rem 0', lineHeight: 1.6 }}>{f.description}</p>

              {f.specialAnnouncement && (
                <div style={{ background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.3) 100%)', color: '#92400e', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
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
