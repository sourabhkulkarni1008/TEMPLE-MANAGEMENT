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
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListOrdered color="#b45309" /> Queue Regulation &amp; Token Dispatch
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Monitor holding day counts, call next token, and manage batch throughput
            </p>
          </div>
          <button onClick={fetchQueues} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {message && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {queues.map((q) => (
            <div key={q.id} className="card" style={{ borderColor: q.highCrowdWarning ? '#fca5a5' : '#e2e8f0' }}>
              {/* High Crowd Warning Banner */}
              {q.highCrowdWarning && (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                  <AlertTriangle size={18} />
                  <span>
                    <strong>High crowd detected in {q.areaName}:</strong> Occupancy exceeds recommended density. Batch intake paced.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>{q.areaName}</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Queue Identifier: {q.id}</div>
                </div>
                <StatusBadge status={q.status} />
              </div>

              {/* Main Numbers Callout */}
              <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Now Serving Token</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#b45309', fontFamily: 'monospace', margin: '4px 0' }}>
                    {q.currentServingToken}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Sanctum Passage</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Pilgrims Waiting</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    {q.waitingCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Inside Holding Days</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Wait</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    {q.estimatedWaitTimeMins}m
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Based on current throughput</div>
                </div>
              </div>

              {/* Staff Queue Controls */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleNextToken(q.id)}
                  disabled={actionLoading || q.status === 'PAUSED'}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 2, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <SkipForward size={18} />
                  <span>Call Next Token Batch</span>
                </button>

                {q.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handlePause(q.id)}
                    disabled={actionLoading}
                    className="btn btn-secondary btn-lg"
                    style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ca8a04', borderColor: '#fde047' }}
                  >
                    <Pause size={18} />
                    <span>Pause Queue</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleResume(q.id)}
                    disabled={actionLoading}
                    className="btn btn-success btn-lg"
                    style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Play size={18} />
                    <span>Resume Queue</span>
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
