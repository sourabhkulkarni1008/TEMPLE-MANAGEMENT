import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { ListOrdered, SkipForward, Pause, Play, Edit3, RefreshCw, AlertTriangle } from 'lucide-react';

const AdminQueueManagement = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQueue, setEditingQueue] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [manualWaiting, setManualWaiting] = useState(0);

  const fetchQueues = async () => {
    try {
      const res = await api.get('/queue');
      if (res.success) setQueues(res.queues || []);
    } catch (err) {
      console.warn('Failed to load queues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleNext = async (queueId) => {
    try {
      await api.post('/queue/next', { queueId });
      fetchQueues();
    } catch (err) {
      alert(err.message || 'Error advancing queue.');
    }
  };

  const handlePause = async (queueId) => {
    try {
      await api.post('/queue/pause', { queueId });
      fetchQueues();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResume = async (queueId) => {
    try {
      await api.post('/queue/resume', { queueId });
      fetchQueues();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!editingQueue) return;

    try {
      await api.put(`/queue/${editingQueue.id}`, {
        currentServingToken: manualToken,
        waitingCount: parseInt(manualWaiting, 10)
      });
      setEditingQueue(null);
      fetchQueues();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Central Queue &amp; Holding Bay Supervision</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Supervise queue token throughput, pause lanes during crowd surges, and calibrate waiting batches</p>
          </div>
          <button onClick={fetchQueues} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Modal for manual queue edit */}
        {editingQueue && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Manual Calibration: {editingQueue.areaName}</h3>
                <button onClick={() => setEditingQueue(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
              </div>
              <form onSubmit={handleSaveManual}>
                <div className="form-group">
                  <label className="form-label">Current Serving Token</label>
                  <input
                    type="text"
                    className="form-input"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Waiting Count (Pilgrims)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={manualWaiting}
                    onChange={(e) => setManualWaiting(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={() => setEditingQueue(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Calibration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid-2">
          {queues.map((q) => (
            <div key={q.id} className="card" style={{ borderColor: q.highCrowdWarning ? '#fca5a5' : '#e2e8f0' }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title" style={{ fontSize: '1.15rem' }}>{q.areaName}</h2>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Queue ID: {q.id}</div>
                </div>
                <StatusBadge status={q.status} />
              </div>

              {q.highCrowdWarning && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <AlertTriangle size={15} />
                  <span>High density holding bay alarm active.</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f8fafc', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SERVING</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#b45309', fontFamily: 'monospace' }}>{q.currentServingToken}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>WAITING</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{q.waitingCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>EST. TIME</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{q.estimatedWaitTimeMins}m</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleNext(q.id)} disabled={q.status === 'PAUSED'} className="btn btn-primary btn-sm" style={{ flex: 2 }}>
                  <SkipForward size={14} /> Next Batch
                </button>
                {q.status === 'ACTIVE' ? (
                  <button onClick={() => handlePause(q.id)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    <Pause size={14} /> Pause
                  </button>
                ) : (
                  <button onClick={() => handleResume(q.id)} className="btn btn-success btn-sm" style={{ flex: 1 }}>
                    <Play size={14} /> Resume
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingQueue(q);
                    setManualToken(q.currentServingToken);
                    setManualWaiting(q.waitingCount);
                  }}
                  className="btn btn-secondary btn-sm"
                  title="Calibrate"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminQueueManagement;
