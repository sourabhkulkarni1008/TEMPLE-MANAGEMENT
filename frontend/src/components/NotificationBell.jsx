import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'EMERGENCY':
        return <AlertTriangle size={16} color="#dc2626" />;
      case 'FESTIVAL':
        return <Sparkles size={16} color="#b45309" />;
      case 'CROWD_ALERT':
        return <AlertTriangle size={16} color="#d97706" />;
      default:
        return <Info size={16} color="#2563eb" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '6px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Notifications & Announcements"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '9999px',
              height: '16px',
              minWidth: '16px',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '320px',
            maxHeight: '400px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            zIndex: 200
          }}
        >
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Announcements ({notifications.length})</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: '#b45309', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ divideY: '1px solid #f8fafc' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No announcements right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.readStatus && markAsRead(n.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: n.readStatus ? '#ffffff' : '#fffbeb',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.readStatus ? 500 : 600, fontSize: '0.825rem', color: '#0f172a' }}>{n.title}</div>
                    <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
