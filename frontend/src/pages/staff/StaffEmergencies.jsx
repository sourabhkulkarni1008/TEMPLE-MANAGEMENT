import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { AlertTriangle, CheckCircle2, Clock, Phone, MapPin, RefreshCw } from 'lucide-react';

const StaffEmergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmergencies = async () => {
    try {
      const res = await api.get('/emergency');
      if (res.success) setEmergencies(res.emergencies || []);
    } catch (err) {
      console.warn('Failed to load emergencies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const payload = { status: newStatus };
      if (newStatus === 'RESOLVED' && resolutionNotes) {
        payload.resolutionNotes = resolutionNotes;
      }

      const res = await api.put(`/emergency/${id}`, payload);
      if (res.success) {
        setSelectedIncident(null);
        setResolutionNotes('');
        fetchEmergencies();
      }
    } catch (err) {
      alert(err.message || 'Failed to update emergency.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle /> Emergency Response Incident Log
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Ground incidents reported by pilgrims and security stations
            </p>
          </div>
          <button onClick={fetchEmergencies} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Modal for resolving with notes */}
        {selectedIncident && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ margin: 0, color: '#0f172a' }}>Resolve Incident: {selectedIncident.emergencyType}</h3>
                <button onClick={() => setSelectedIncident(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                Location: <strong>{selectedIncident.area}</strong> &bull; Reporter: <strong>{selectedIncident.reporterName} ({selectedIncident.reporterPhone})</strong>
              </p>

              <div className="form-group">
                <label className="form-label">Resolution Actions &amp; Medical / Security Notes</label>
                <textarea
                  className="form-textarea"
                  required
                  placeholder="e.g. First-aid team administered glucose and attendee was escorted safely..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setSelectedIncident(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedIncident.id, 'RESOLVED')}
                  className="btn btn-success"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Mark Incident as Resolved'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List of Emergencies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {emergencies.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '1.1rem' }}>All Clear</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No pending emergency incidents on temple grounds.</p>
            </div>
          ) : (
            emergencies.map((emg) => (
              <div
                key={emg.id}
                className="card"
                style={{
                  borderColor: emg.status === 'PENDING' ? '#fca5a5' : (emg.status === 'RESPONDING' ? '#fde047' : '#e2e8f0'),
                  marginBottom: 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: emg.status === 'PENDING' ? '#991b1b' : '#0f172a' }}>
                      {emg.emergencyType} Alert
                    </span>
                    <div style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <MapPin size={13} color="#b45309" /> <strong>{emg.area}</strong> &bull; Reporter: {emg.reporterName} ({emg.reporterPhone})
                    </div>
                  </div>
                  <StatusBadge status={emg.status} />
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', margin: '0.5rem 0 1rem', color: '#1e293b' }}>
                  {emg.description}
                </div>

                {emg.resolutionNotes && (
                  <div style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#166534', padding: '6px 10px', borderRadius: '4px', marginBottom: '1rem' }}>
                    <strong>Resolution Log:</strong> {emg.resolutionNotes} (Resolved on {new Date(emg.resolvedAt).toLocaleString()})
                  </div>
                )}

                {/* Status Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <div>Reported at: {new Date(emg.createdAt).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {emg.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(emg.id, 'RESPONDING')}
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading}
                      >
                        Accept &amp; Dispatch Unit
                      </button>
                    )}
                    {emg.status !== 'RESOLVED' && (
                      <button
                        onClick={() => {
                          setSelectedIncident(emg);
                          setResolutionNotes('');
                        }}
                        className="btn btn-success btn-sm"
                      >
                        Complete / Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffEmergencies;
