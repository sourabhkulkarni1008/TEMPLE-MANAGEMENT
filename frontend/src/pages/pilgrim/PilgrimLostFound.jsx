import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { Package, Search, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

const PilgrimLostFound = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    itemName: '',
    category: 'Valuables',
    area: 'Queue Complex & Holding Days',
    contactPhone: user?.phone || '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      const res = await api.get('/lost-found');
      if (res.success) setItems(res.items || []);
    } catch (err) {
      console.warn('Failed to load lost items:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/lost-found', form);
      if (res.success) {
        setMessage('Lost item report registered with Temple Security.');
        setShowModal(false);
        setForm({
          itemName: '',
          category: 'Valuables',
          area: 'Queue Complex & Holding Days',
          contactPhone: user?.phone || '',
          description: ''
        });
        fetchItems();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              Lost &amp; Found Assistance Registry
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Report misplaced possessions or track recovered property safely stored in temple security custody.
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
            <span>Report Lost Property</span>
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
          </div>
        )}

        {/* Modal for reporting */}
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
                  <Package size={20} style={{ color: '#f59e0b' }} /> Report Misplaced Possession
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
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Item Name / Brief Summary</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Leather Wallet / Titan Watch / Red Bag"
                      value={form.itemName}
                      onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Category</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="Valuables">Valuables (Wallet, Gold, Cash)</option>
                        <option value="Electronics">Electronics (Mobile, Watch)</option>
                        <option value="Documents/Cards">Documents / Identity Cards</option>
                        <option value="Clothing/Bags">Clothing / Handbags</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Approximate Area</label>
                      <select
                        className="form-select"
                        value={form.area}
                        onChange={(e) => setForm({ ...form, area: e.target.value })}
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
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Callback Contact Mobile</label>
                    <input
                      type="tel"
                      className="form-input"
                      required
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Detailed Identification Marks</label>
                    <textarea
                      className="form-textarea"
                      required
                      placeholder="Color, brand name, distinctive features, inside contents..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      style={{ borderRadius: '8px', minHeight: '80px' }}
                    />
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
                      disabled={loading}
                      style={{ borderRadius: '8px', padding: '0.65rem 1.25rem', fontWeight: 700 }}
                    >
                      {loading ? 'Submitting...' : 'Register Item Report'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* List of Registered Items */}
        <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
          <div className="table-container" style={{ border: 'none', margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.25rem' }}>Item Description</th>
                  <th>Category</th>
                  <th>Last Seen Location</th>
                  <th>Current Status</th>
                  <th>Date Reported</th>
                  <th style={{ paddingRight: '1.25rem' }}>Verification Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <Package size={36} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
                      <div style={{ fontWeight: 600 }}>No lost items currently recorded in this registry.</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '4px' }}>Ground staff will list recovered items as they are turned in.</div>
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a', paddingLeft: '1.25rem' }}>{it.itemName}</td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          background: 'rgba(241, 245, 249, 0.9)', 
                          padding: '3px 8px', 
                          borderRadius: '6px',
                          color: '#475569'
                        }}>
                          {it.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{it.area}</td>
                      <td><StatusBadge status={it.status} /></td>
                      <td style={{ fontSize: '0.825rem', color: '#64748b' }}>{it.reportedDate}</td>
                      <td style={{ fontSize: '0.825rem', color: '#475569', maxWidth: '280px', paddingRight: '1.25rem', lineHeight: 1.4 }}>
                        {it.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PilgrimLostFound;
