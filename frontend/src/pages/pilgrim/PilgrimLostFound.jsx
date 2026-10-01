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
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Lost &amp; Found Assistance Desk</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Report misplaced possessions or check recovered property in temple custody</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} />
            <span>Report Lost Property</span>
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Modal for reporting */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Report Misplaced Possession</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Item Name / Summary</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Leather Wallet / Titan Watch / Red Bag"
                    value={form.itemName}
                    onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="Valuables">Valuables (Wallet, Gold, Money)</option>
                      <option value="Electronics">Electronics (Mobile, Earphones, Watch)</option>
                      <option value="Documents/Cards">Documents / Identity Cards</option>
                      <option value="Clothing/Bags">Clothing / Handbags</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Approximate Area</label>
                    <select
                      className="form-select"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
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

                <div className="form-group">
                  <label className="form-label">Callback Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description / Unique Identification Marks</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Color, brand name, distinctive features, inside contents..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Register Item Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List of Registered Items */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Last Seen Location</th>
                  <th>Status</th>
                  <th>Date Reported</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No lost items currently in the registry.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id}>
                      <td style={{ fontWeight: 600 }}>{it.itemName}</td>
                      <td>{it.category}</td>
                      <td>{it.area}</td>
                      <td><StatusBadge status={it.status} /></td>
                      <td>{it.reportedDate}</td>
                      <td style={{ fontSize: '0.825rem', color: '#475569', maxWidth: '280px' }}>{it.description}</td>
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
