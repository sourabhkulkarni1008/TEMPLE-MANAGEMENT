import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { AlertTriangle, CheckCircle2, Clock, MapPin, RefreshCw, User } from 'lucide-react';

const AdminEmergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [notes, setNotes] = useState('');
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
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setActionLoading(true);

    try {
      await api.put(`/emergency/${selectedIncident.id}`, {
        status: 'RESOLVED',
        resolutionNotes: notes
      });
      setSelectedIncident(null);
      setNotes('');
      fetchEmergencies();
    } catch (err) {
      alert(err.message);
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
                Central Emergency &amp; Ground Incidents Command
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Supervise distress calls, missing child alerts, medical incidents, and security responses across temple grounds.
            </p>
          </div>
          <button 
            onClick={fetchEmergencies} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600, padding: '0.5rem 0.9rem' }}
          >
            <RefreshCw size={14} /> Refresh Incidents
          </button>
        </div>

        {/* Modal for resolution */}
        {selectedIncident && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.65)' }}>
            <div className="modal-content glass-card card-gold-trim" style={{ padding: 0, borderRadius: '16px', maxWidth: '520px', overflow: 'hidden' }}>
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
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} /> Resolve Incident #{selectedIncident.id}
                </h3>
                <button 
                  onClick={() => setSelectedIncident(null)} 
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

              <div style={{ padding: '1.5rem' }}>
                <form onSubmit={handleResolve}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Resolution Actions &amp; Post-Incident Summary</label>
                    <textarea
                      className="form-textarea"
                      required
                      placeholder="Document actions taken by security / first aid responders..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ borderRadius: '8px', minHeight: '90px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setSelectedIncident(null)} 
                      className="btn btn-secondary"
                      style={{ borderRadius: '8px', padding: '0.65rem 1.25rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-success" 
                      disabled={actionLoading}
                      style={{ borderRadius: '8px', padding: '0.65rem 1.25rem', fontWeight: 700 }}
                    >
                      {actionLoading ? 'Saving...' : 'Mark Incident Resolved'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Log Table */}
        <div className="card card-gold-trim glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
          <div className="table-container" style={{ border: 'none', margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.25rem' }}>Incident Type</th>
                  <th>Location Sector</th>
                  <th>Reporting Devotee</th>
                  <th>Contact Phone</th>
                  <th>Time Reported</th>
                  <th>Status</th>
                  <th style={{ paddingRight: '1.25rem' }}>Command Action</th>
                </tr>
              </thead>
              <tbody>
                {emergencies.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 600 }}>All Clear - No emergency incidents reported.</div>
                    </td>
                  </tr>
                ) : (
                  emergencies.map((emg) => (
                    <tr key={emg.id}>
                      <td style={{ paddingLeft: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {emg.status === 'PENDING' && <span className="pulse-dot" style={{ background: '#ef4444' }} />}
                          <strong style={{ color: emg.status === 'PENDING' ? '#dc2626' : '#0f172a' }}>
                            {emg.emergencyType}
                          </strong>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{emg.area}</td>
                      <td>{emg.reporterName}</td>
                      <td style={{ fontSize: '0.85rem' }}>{emg.reporterPhone}</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(emg.createdAt).toLocaleString()}</td>
                      <td><StatusBadge status={emg.status} /></td>
                      <td style={{ paddingRight: '1.25rem' }}>
                        {emg.status !== 'RESOLVED' ? (
                          <button
                            onClick={() => {
                              setSelectedIncident(emg);
                              setNotes(emg.resolutionNotes || '');
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ borderRadius: '6px', fontWeight: 700 }}
                          >
                            Resolve Incident
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>Closed</span>
                        )}
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

export default AdminEmergencies;
