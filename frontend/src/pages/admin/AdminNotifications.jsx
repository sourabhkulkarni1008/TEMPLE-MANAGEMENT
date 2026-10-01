import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Bell, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [type, setType] = useState('INFO');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) setNotifications(res.notifications || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/notifications/broadcast', {
        title,
        message: messageText,
        type
      });
      if (res.success) {
        setSuccess('Broadcast announcement published to all pilgrims and staff.');
        setTitle('');
        setMessageText('');
        fetchNotifs();
      }
    } catch (err) {
      setError(err.message || 'Failed to broadcast announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content" style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell color="#b45309" /> Temple Announcements &amp; Broadcast Dispatch
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Publish global alerts, ritual timings, crowd advisories, and emergency bulletins</p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Broadcast Form */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Compose Broadcast Notice</h2>

          <form onSubmit={handleBroadcast}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Announcement Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Maha Aarti Schedule Update"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notice Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="INFO">General Information (INFO)</option>
                  <option value="CROWD_ALERT">Crowd Density Advisory (CROWD_ALERT)</option>
                  <option value="FESTIVAL">Festival Mode Notice (FESTIVAL)</option>
                  <option value="EMERGENCY">Urgent Security/Weather Alert (EMERGENCY)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Message Body</label>
              <textarea
                className="form-textarea"
                required
                placeholder="Enter details visible to all connected pilgrim dashboards..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={15} />
              <span>{loading ? 'Publishing...' : 'Broadcast Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Broadcast History</h2>
            <button onClick={fetchNotifs} className="btn btn-secondary btn-sm"><RefreshCw size={13} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.slice(0, 10).map((n) => (
              <div key={n.id} style={{ border: '1px solid #f1f5f9', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{n.title}</strong>
                  <span className="badge" style={{ fontSize: '0.7rem' }}>{n.type}</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#475569', margin: '2px 0' }}>{n.message}</p>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
