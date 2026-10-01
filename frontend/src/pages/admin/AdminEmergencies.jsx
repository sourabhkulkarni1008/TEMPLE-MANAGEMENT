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
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle /> Central Emergency &amp; Ground Incidents Command
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Supervise all medical distress calls, child separation alarms, and security reports</p>
          </div>
          <button onClick={fetchEmergencies} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Modal for resolution */}
        {selectedIncident && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Resolve Emergency Alert #{selectedIncident.id}</h3>
                <button onClick={() => setSelectedIncident(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <form onSubmit={handleResolve}>
                <div className="form-group">
                  <label className="form-label">Resolution Actions &amp; Post-Incident Summary</label>
                  <textarea
                    className="form-textarea"
                    required
                    placeholder="Document actions taken by security / first aid responders..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={() => setSelectedIncident(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Mark Incident Resolved'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Emergency Log Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Reporter</th>
                  <th>Contact</th>
                  <th>Reported Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {emergencies.map((emg) => (
                  <tr key={emg.id}>
                    <td>
                      <strong style={{ color: emg.status === 'PENDING' ? '#dc2626' : '#0f172a' }}>
                        {emg.emergencyType}
                      </strong>
                    </td>
                    <td>{emg.area}</td>
                    <td>{emg.reporterName}</td>
                    <td>{emg.reporterPhone}</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(emg.createdAt).toLocaleString()}</td>
                    <td><StatusBadge status={emg.status} /></td>
                    <td>
                      {emg.status !== 'RESOLVED' ? (
                        <button
                          onClick={() => {
                            setSelectedIncident(emg);
                            setNotes(emg.resolutionNotes || '');
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#166534' }}>Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmergencies;
