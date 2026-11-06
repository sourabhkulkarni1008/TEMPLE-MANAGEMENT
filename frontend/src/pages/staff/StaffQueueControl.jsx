import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { ListOrdered, Play, Pause, SkipForward, AlertTriangle, Users, Clock, RefreshCw } from 'lucide-react';

const StaffQueueControl = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchQueues = async () => {
    try {
      const res = await api.get('/queue');
      if (res.success) setQueues(res.queues || []);
    } catch (err) {
      console.warn('Queue fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleNextToken = async (queueId) => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await api.post('/queue/next', { queueId });
      if (res.success) {
        setMessage(`Queue successfully advanced to Token ${res.queue.currentServingToken}`);
        fetchQueues();
      }
    } catch (err) {
      alert(err.message || 'Failed to advance queue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async (queueId) => {
    setActionLoading(true);
    try {
      const res = await api.post('/queue/pause', { queueId });
      if (res.success) {
        setMessage('Queue paused.');
        fetchQueues();
      }
    } catch (err) {
      alert(err.message || 'Failed to pause queue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async (queueId) => {
    setActionLoading(true);
    try {
      const res = await api.post('/queue/resume', { queueId });
      if (res.success) {
        setMessage('Queue resumed to active serving state.');
        fetchQueues();
      }
    } catch (err) {
      alert(err.message || 'Failed to resume queue.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
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
                Queue Regulation &amp; Token Dispatch
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Live telemetry monitoring holding day density, calling next token batches, and governing pedestrian intake pace.
            </p>
          </div>
          <button 
            onClick={fetchQueues} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '0.5rem 0.9rem', fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh Telemetry
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', padding: '0.85rem 1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {queues.map((q) => (
            <div 
              key={q.id} 
              className={`card glass-card ${q.highCrowdWarning ? '' : 'card-gold-trim'}`} 
              style={{ 
                borderColor: q.highCrowdWarning ? '#fca5a5' : undefined,
                boxShadow: q.highCrowdWarning ? '0 8px 30px rgba(239, 68, 68, 0.12)' : undefined,
                borderRadius: '16px',
                padding: '1.75rem'
              }}
            >
              {/* High Crowd Warning Banner */}
              {q.highCrowdWarning && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem' }}>
                    <strong>High crowd density detected in {q.areaName}:</strong> Occupancy exceeds recommended safe surge threshold. Batch intake pace adjusted.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{q.areaName}</h2>
                  <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>Queue ID: <code style={{ color: '#d97706', fontWeight: 700 }}>{q.id}</code></div>
                </div>
                <StatusBadge status={q.status} />
              </div>

              {/* Main Numbers Callout */}
              <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.5) 0%, rgba(253, 230, 138, 0.25) 100%)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', 
                  borderRadius: '12px', 
                  padding: '1.5rem 1rem', 
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#92400e', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Now Serving Token</div>
                  <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#b45309', fontFamily: 'monospace', margin: '4px 0', textShadow: '0 2px 8px rgba(180, 83, 9, 0.15)' }}>
                    {q.currentServingToken}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#78350f', fontWeight: 500 }}>Active Sanctum Passage</div>
                </div>

                <div style={{ 
                  background: 'rgba(248, 250, 252, 0.8)', 
                  border: '1px solid rgba(226, 232, 240, 0.9)', 
                  borderRadius: '12px', 
                  padding: '1.5rem 1rem', 
                  textAlign: 'center' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Pilgrims Waiting</div>
                  <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                    {q.waitingCount}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Holding Enclosures</div>
                </div>

                <div style={{ 
                  background: 'rgba(248, 250, 252, 0.8)', 
                  border: '1px solid rgba(226, 232, 240, 0.9)', 
                  borderRadius: '12px', 
                  padding: '1.5rem 1rem', 
                  textAlign: 'center' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Estimated Wait</div>
                  <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                    {q.estimatedWaitTimeMins}m
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Dynamic Speed Metric</div>
                </div>
              </div>

              {/* Staff Queue Controls */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleNextToken(q.id)}
                  disabled={actionLoading || q.status === 'PAUSED'}
                  className="btn btn-primary btn-lg"
                  style={{ 
                    flex: 2, 
                    minWidth: '220px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    padding: '0.9rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
                  }}
                >
                  <SkipForward size={20} />
                  <span>Call Next Token Batch &rarr;</span>
                </button>

                {q.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handlePause(q.id)}
                    disabled={actionLoading}
                    className="btn btn-secondary btn-lg"
                    style={{ 
                      flex: 1, 
                      minWidth: '160px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      color: '#d97706', 
                      borderColor: '#fde68a',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}
                  >
                    <Pause size={18} />
                    <span>Pause Intake</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleResume(q.id)}
                    disabled={actionLoading}
                    className="btn btn-success btn-lg"
                    style={{ 
                      flex: 1, 
                      minWidth: '160px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}
                  >
                    <Play size={18} />
                    <span>Resume Intake</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffQueueControl;
