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
    area: 'Queue Complex & Holding Days',
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
      <div className="dashboard-content" style={{ maxWidth: '840px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ 
              display: 'inline-flex', 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: '#dc2626', 
              padding: '8px', 
              borderRadius: '50%',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <AlertTriangle size={24} />
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626', margin: 0 }}>
              Emergency Assistance &amp; Ground SOS
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Instant high-priority broadcast to temple first-aid medical teams, queue marshals, and security command desk.
          </p>
        </div>

        {/* Quick Speed Dial Strip */}
        <div className="grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
            <Phone size={24} style={{ color: '#ef4444' }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Medical First-Aid</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>108 / Ext. 101</div>
            </div>
          </div>
          <div className="card glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
            <Phone size={24} style={{ color: '#f59e0b' }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Temple Security</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Ext. 204 (North Gate)</div>
            </div>
          </div>
          <div className="card glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
            <Phone size={24} style={{ color: '#3b82f6' }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Lost Person Booth</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Ext. 305 (Main Office)</div>
            </div>
          </div>
        </div>

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderRadius: '12px', padding: '1rem 1.25rem' }}>
            <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>SOS Transmitted Successfully!</strong>
              <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                Ground emergency staff have received your report with highest priority and are moving to your reported area.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderRadius: '12px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <div className="card glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 8px 30px rgba(239, 68, 68, 0.08)', marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.04) 100%)', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h2 style={{ color: '#991b1b', fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot" style={{ background: '#ef4444' }} /> Dispatch High-Priority SOS
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#7f1d1d', margin: '4px 0 0 0' }}>
              Please provide precise location details so the nearest responder can reach you quickly.
            </p>
          </div>

          <div style={{ padding: '1.75rem 1.5rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Nature of Emergency</label>
                  <select
                    className="form-select"
                    value={form.emergencyType}
                    onChange={(e) => setForm({ ...form, emergencyType: e.target.value })}
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="Medical">Medical (Dizziness, Heatstroke, Injury)</option>
                    <option value="Lost Person">Lost Person / Child Missing</option>
                    <option value="Security">Security / Suspicious Activity</option>
                    <option value="Crowd Surge">High Crowd Surge / Bottleneck</option>
                    <option value="Other">Other Urgent Assistance</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Your Exact Temple Location</label>
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

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  value={form.reporterPhone}
                  onChange={(e) => setForm({ ...form, reporterPhone: e.target.value })}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Situation Details & Nearby Landmark</label>
                <textarea
                  className="form-textarea"
                  required
                  placeholder="e.g., Near Bay 2 pillar 8, elderly person needs wheelchair and water..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ borderRadius: '8px', minHeight: '90px' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-danger btn-lg" 
                disabled={loading} 
                style={{ 
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
                }}
              >
                {loading ? 'Transmitting High-Priority SOS...' : 'Transmit Immediate Ground SOS'}
              </button>
            </form>
          </div>
        </div>

        {/* Previous Reports History */}
        <div className="card card-gold-trim glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              My Emergency Requests
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {emergencies.length} total recorded
            </span>
          </div>

          {emergencies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>No emergency reports currently on file for your account.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {emergencies.map((emg) => (
                <div 
                  key={emg.id} 
                  style={{ 
                    border: '1px solid rgba(226, 232, 240, 0.8)', 
                    borderRadius: '10px', 
                    padding: '1rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{emg.emergencyType} &bull; {emg.area}</strong>
                    <StatusBadge status={emg.status} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 8px 0', lineHeight: 1.5 }}>{emg.description}</p>
                  {emg.resolutionNotes && (
                    <div style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#166534', padding: '6px 10px', borderRadius: '6px', marginBottom: '6px', border: '1px solid #bbf7d0' }}>
                      <strong>Resolution Note:</strong> {emg.resolutionNotes}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
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
