import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { CalendarCheck, PlusCircle, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const AdminDarshanSlots = () => {
  const [slots, setSlots] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(todayStr);

  const [form, setForm] = useState({
    darshanType: 'General Darshan (Sarva Darshanam)',
    slotDate: todayStr,
    startTime: '06:00 AM',
    endTime: '08:00 AM',
    price: 0,
    capacity: 200
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSlots = async () => {
    try {
      const [slotRes, typeRes] = await Promise.all([
        api.get(`/darshan/slots?date=${filterDate}`),
        api.get('/darshan/types')
      ]);
      if (slotRes.success) setSlots(slotRes.slots || []);
      if (typeRes.success) setTypes(typeRes.types || []);
    } catch (err) {
      console.warn('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [filterDate]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      const res = await api.post('/darshan/slots', form);
      if (res.success) {
        setMessage('New darshan slot opened successfully.');
        setShowModal(false);
        fetchSlots();
      }
    } catch (err) {
      setError(err.message || 'Failed to create slot.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                Darshan Slots &amp; Quotas Management
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Configure daily visitor capacity quotas, audit real-time bookings, and provision special VIP or festival slots.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
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
            <span>Create New Time Slot</span>
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
          </div>
        )}

        {/* Date Selector Filter */}
        <div className="card card-gold-trim glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Filter by Darshan Date:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: '220px', borderRadius: '8px' }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button 
              onClick={fetchSlots} 
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600, padding: '0.5rem 0.9rem' }}
            >
              <RefreshCw size={14} /> Refresh Quotas
            </button>
          </div>
        </div>

        {/* Modal for Creating Slot */}
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
                  <CalendarCheck size={20} style={{ color: '#f59e0b' }} /> Create New Darshan Slot
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

                <form onSubmit={handleCreateSlot}>
                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Darshan Category</label>
                    <select
                      className="form-select"
                      value={form.darshanType}
                      onChange={(e) => {
                        const dt = types.find(t => t.name === e.target.value);
                        setForm({
                          ...form,
                          darshanType: e.target.value,
                          price: dt?.price || 0,
                          capacity: dt?.quotaPerSlot || 150
                        });
                      }}
                      style={{ borderRadius: '8px' }}
                    >
                      {types.map((t) => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Slot Date</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={form.slotDate}
                        onChange={(e) => setForm({ ...form, slotDate: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Max Capacity (Pilgrims)</label>
                      <input
                        type="number"
                        className="form-input"
                        required
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Start Time</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="06:00 AM"
                        required
                        value={form.startTime}
                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>End Time</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="08:00 AM"
                        required
                        value={form.endTime}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
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
                      {actionLoading ? 'Creating...' : 'Open Slot &amp; Publish'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Slots Table */}
        <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
          <div className="table-container" style={{ border: 'none', margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.25rem' }}>Category</th>
                  <th>Date</th>
                  <th>Time Window</th>
                  <th>Ticket Fee</th>
                  <th>Booked / Capacity</th>
                  <th>Utilization</th>
                  <th style={{ paddingRight: '1.25rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <CalendarCheck size={36} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                      <div style={{ fontWeight: 600 }}>No slots configured for {filterDate}.</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '4px' }}>Click "Create New Time Slot" to schedule entries.</div>
                    </td>
                  </tr>
                ) : (
                  slots.map((s) => {
                    const pct = Math.round((s.bookedCount / s.capacity) * 100);
                    return (
                      <tr key={s.id}>
                        <td style={{ paddingLeft: '1.25rem' }}>
                          <strong style={{ color: '#0f172a' }}>{s.darshanType.split('(')[0]}</strong>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{s.slotDate}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.startTime} - {s.endTime}</td>
                        <td style={{ fontWeight: 700, color: s.price === 0 ? '#16a34a' : '#d97706' }}>
                          {s.price === 0 ? 'Free' : `₹${s.price}`}
                        </td>
                        <td style={{ fontWeight: 600 }}>{s.bookedCount} / {s.capacity}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '70px', background: 'rgba(226, 232, 240, 0.8)', height: '7px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, pct)}%`, background: pct >= 90 ? '#ef4444' : (pct >= 60 ? '#f59e0b' : '#10b981'), height: '100%' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pct >= 90 ? '#ef4444' : '#64748b' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ paddingRight: '1.25rem' }}><StatusBadge status={s.status} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDarshanSlots;
