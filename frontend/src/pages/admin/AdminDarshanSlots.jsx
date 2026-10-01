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
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Darshan Slots &amp; Quotas Management</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Configure daily capacity quotas, view booked numbers, and create special slots</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} />
            <span>Create New Time Slot</span>
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Date Selector Filter */}
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter by Slot Date:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: '220px' }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button onClick={fetchSlots} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Modal for Creating Slot */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Create New Darshan Slot</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleCreateSlot}>
                <div className="form-group">
                  <label className="form-label">Darshan Category</label>
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
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Slot Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={form.slotDate}
                      onChange={(e) => setForm({ ...form, slotDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Capacity (Pilgrims)</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="06:00 AM"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="08:00 AM"
                      required
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? 'Creating...' : 'Open Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Slots Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Time Window</th>
                  <th>Price</th>
                  <th>Booked / Capacity</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No slots configured for {filterDate}.
                    </td>
                  </tr>
                ) : (
                  slots.map((s) => {
                    const pct = Math.round((s.bookedCount / s.capacity) * 100);
                    return (
                      <tr key={s.id}>
                        <td><strong>{s.darshanType.split('(')[0]}</strong></td>
                        <td>{s.slotDate}</td>
                        <td>{s.startTime} - {s.endTime}</td>
                        <td>{s.price === 0 ? 'Free' : `₹${s.price}`}</td>
                        <td>{s.bookedCount} / {s.capacity}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '60px', background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, pct)}%`, background: pct >= 90 ? '#dc2626' : '#b45309', height: '100%' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem' }}>{pct}%</span>
                          </div>
                        </td>
                        <td><StatusBadge status={s.status} /></td>
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
