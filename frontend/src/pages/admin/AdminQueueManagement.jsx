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
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ 
                display: 'inline-flex', 
                background: 'rgba(217, 119, 6, 0.15)', 
                color: '#d97706', 
                padding: '8px', 
                borderRadius: '50%',
                border: '1px solid rgba(217, 119, 6, 0.3)'
              }}>
                <ListOrdered size={24} />
              </span>
              <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                Central Queue &amp; Holding Day Supervision
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Supervise token throughput speeds, pace pilgrim entry batches during surges, and calibrate holding enclosure limits.
            </p>
          </div>
          <button 
            onClick={fetchQueues} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600, padding: '0.5rem 0.9rem' }}
          >
            <RefreshCw size={14} /> Refresh Queues
          </button>
        </div>

        {/* Modal for manual queue edit */}
        {editingQueue && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.65)' }}>
            <div className="modal-content glass-card card-gold-trim" style={{ padding: 0, borderRadius: '16px', maxWidth: '480px', overflow: 'hidden' }}>
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
                  <Edit3 size={18} style={{ color: '#f59e0b' }} /> Calibrate: {editingQueue.areaName}
                </h3>
                <button 
                  onClick={() => setEditingQueue(null)} 
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
                <form onSubmit={handleSaveManual}>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Current Serving Token</label>
                    <input
                      type="text"
                      className="form-input"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      style={{ borderRadius: '8px', fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Waiting Count (Pilgrims in Holding)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={manualWaiting}
                      onChange={(e) => setManualWaiting(e.target.value)}
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setEditingQueue(null)} 
                      className="btn btn-secondary"
                      style={{ borderRadius: '8px', padding: '0.65rem 1.25rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ borderRadius: '8px', padding: '0.65rem 1.25rem', fontWeight: 700 }}
                    >
                      Save Calibration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {queues.map((q) => (
            <div 
              key={q.id} 
              className={`card glass-card ${q.highCrowdWarning ? '' : 'card-gold-trim'}`} 
              style={{ 
                borderColor: q.highCrowdWarning ? '#fca5a5' : undefined,
                boxShadow: q.highCrowdWarning ? '0 8px 30px rgba(239, 68, 68, 0.12)' : undefined,
                borderRadius: '16px',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{q.areaName}</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>Queue ID: <code style={{ color: '#d97706', fontWeight: 700 }}>{q.id}</code></div>
                </div>
                <StatusBadge status={q.status} />
              </div>

              {q.highCrowdWarning && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>High density holding day alarm active. Batch intake throttled.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'rgba(248, 250, 252, 0.8)', padding: '1.25rem 0.75rem', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.9)', marginBottom: '1.25rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>SERVING</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#b45309', fontFamily: 'monospace', margin: '4px 0' }}>{q.currentServingToken}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Now Entry</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>WAITING</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>{q.waitingCount}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Holding Bays</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>EST. TIME</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>{q.estimatedWaitTimeMins}m</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Pace Meter</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleNext(q.id)} 
                  disabled={q.status === 'PAUSED'} 
                  className="btn btn-primary btn-sm" 
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', fontWeight: 700, padding: '0.65rem' }}
                >
                  <SkipForward size={16} /> Next Batch
                </button>
                {q.status === 'ACTIVE' ? (
                  <button 
                    onClick={() => handlePause(q.id)} 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600, color: '#d97706', borderColor: '#fde68a' }}
                  >
                    <Pause size={16} /> Pause
                  </button>
                ) : (
                  <button 
                    onClick={() => handleResume(q.id)} 
                    className="btn btn-success btn-sm" 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', fontWeight: 600 }}
                  >
                    <Play size={16} /> Resume
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingQueue(q);
                    setManualToken(q.currentServingToken);
                    setManualWaiting(q.waitingCount);
                  }}
                  className="btn btn-secondary btn-sm"
                  title="Calibrate Queue Parameters"
                  style={{ borderRadius: '8px', padding: '0.65rem 0.85rem' }}
                >
                  <Edit3 size={16} />
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
