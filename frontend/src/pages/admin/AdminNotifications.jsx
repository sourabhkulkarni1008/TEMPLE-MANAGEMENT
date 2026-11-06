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
      <div className="dashboard-content" style={{ maxWidth: '860px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ 
              display: 'inline-flex', 
              background: 'rgba(217, 119, 6, 0.15)', 
              color: '#d97706', 
              padding: '8px', 
              borderRadius: '50%',
              border: '1px solid rgba(217, 119, 6, 0.3)'
            }}>
              <Bell size={24} />
            </span>
            <h1 className="temple-gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
              Temple Announcements &amp; Broadcast Dispatch
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Dispatch instant notifications, ritual schedules, crowd advisories, and weather bulletins to all active pilgrims and gate officers.
          </p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Broadcast Form */}
        <div className="card card-gold-trim glass-card" style={{ marginBottom: '1.75rem', borderRadius: '16px', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            Compose Broadcast Notice
          </h2>

          <form onSubmit={handleBroadcast}>
            <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Announcement Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Maha Aarti Schedule Update"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Notice Category</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="INFO">General Information (INFO)</option>
                  <option value="CROWD_ALERT">Crowd Density Advisory (CROWD_ALERT)</option>
                  <option value="FESTIVAL">Festival Mode Notice (FESTIVAL)</option>
                  <option value="EMERGENCY">Urgent Security/Weather Alert (EMERGENCY)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Announcement Message Body</label>
              <textarea
                className="form-textarea"
                required
                placeholder="Enter details visible to all connected pilgrim dashboards..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{ borderRadius: '8px', minHeight: '90px' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading} 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '0.75rem 1.5rem',
                fontWeight: 700,
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
              }}
            >
              <Send size={16} />
              <span>{loading ? 'Publishing...' : 'Broadcast Announcement to Devotees'}</span>
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="card card-gold-trim glass-card" style={{ borderRadius: '16px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Recent Broadcast Dispatch Feed
            </h2>
            <button 
              onClick={fetchNotifs} 
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '6px', padding: '4px 8px' }}
              title="Refresh Announcements"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                No announcements dispatched yet.
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div 
                  key={n.id} 
                  style={{ 
                    border: '1px solid rgba(226, 232, 240, 0.8)', 
                    borderRadius: '10px', 
                    padding: '1rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{n.title}</strong>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{n.type}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 6px 0', lineHeight: 1.5 }}>{n.message}</p>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
