import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { AlertTriangle, CheckCircle2, Phone, Clock, AlertCircle } from 'lucide-react';

const PilgrimEmergency = () => {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [form, setForm] = useState({
    emergencyType: 'Medical',
    area: 'Queue Complex & Holding Bays',
    description: '',
    reporterName: user?.name || '',
    reporterPhone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchMyEmergencies = async () => {
    try {
      const res = await api.get('/emergency');
      if (res.success) setEmergencies(res.emergencies || []);
    } catch (err) {
      console.warn('Failed to load emergencies:', err);
    }
  };

  useEffect(() => {
    fetchMyEmergencies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/emergency', form);
      if (res.success) {
        setSuccess(true);
        setForm({
          ...form,
          description: ''
        });
        fetchMyEmergencies();
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch SOS alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle /> Emergency Assistance &amp; Ground SOS
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Direct broadcast to temple first-aid medical assistants, queue marshals, and security control
          </p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={20} />
            <div>
              <strong>SOS Transmitted:</strong> Ground staff have received your report and are dispatching assistance to your area.
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="card" style={{ borderColor: '#fca5a5', marginBottom: '2rem' }}>
          <h2 className="card-title" style={{ color: '#991b1b', marginBottom: '1rem' }}>Dispatch Urgent Alert</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nature of Emergency</label>
                <select
                  className="form-select"
                  value={form.emergencyType}
                  onChange={(e) => setForm({ ...form, emergencyType: e.target.value })}
                >
                  <option value="Medical">Medical (Dizziness, Heat, First-aid)</option>
                  <option value="Lost Person">Lost Person / Child Missing</option>
                  <option value="Security">Security / Suspicious Activity</option>
                  <option value="Crowd Surge">High Crowd Surge / Bottlenecking</option>
                  <option value="Other">Other Urgent Assistance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Exact Temple Location</label>
                <select
                  className="form-select"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                >
                  <option value="Main Entrance & Security Gate">Main Entrance & Security Gate</option>
                  <option value="Queue Complex & Holding Bays">Queue Complex & Holding Bays</option>
                  <option value="Main Sanctum / Darshan Hall">Main Sanctum / Darshan Hall</option>
                  <option value="Prasadam Distribution Counter">Prasadam Distribution Counter</option>
                  <option value="Exit Corridor & Shoe Stand">Exit Corridor & Shoe Stand</option>
                  <option value="North & South Parking Lot">North & South Parking Lot</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input
                type="tel"
                className="form-input"
                required
                value={form.reporterPhone}
                onChange={(e) => setForm({ ...form, reporterPhone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Situation Description / Specific Landmark</label>
              <textarea
                className="form-textarea"
                required
                placeholder="e.g., Near Bay 2 pillar 8, elderly person needs water and chair..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-danger btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Transmitting Alert...' : 'Transmit Emergency SOS Alert'}
            </button>
          </form>
        </div>

        {/* Previous Reports History */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Recent Emergency Requests</h2>
          </div>
          {emergencies.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No emergency reports filed under your account.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {emergencies.map((emg) => (
                <div key={emg.id} style={{ border: '1px solid #f1f5f9', borderRadius: '6px', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong>{emg.emergencyType} - {emg.area}</strong>
                    <StatusBadge status={emg.status} />
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#475569', margin: '4px 0' }}>{emg.description}</p>
                  {emg.resolutionNotes && (
                    <div style={{ fontSize: '0.775rem', background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>
                      <strong>Resolution Note:</strong> {emg.resolutionNotes}
                    </div>
                  )}
                  <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '4px' }}>
                    Reported on: {new Date(emg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PilgrimEmergency;
