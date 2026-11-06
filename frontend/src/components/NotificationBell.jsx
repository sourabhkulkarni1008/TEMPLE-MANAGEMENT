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
            top: 'calc(100% + 10px)',
            width: '340px',
            maxHeight: '420px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            borderRadius: '14px',
            boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 0 16px rgba(245, 158, 11, 0.12)',
            overflowY: 'auto',
            zIndex: 300,
            animation: 'fadeIn 0.18s ease-out'
          }}
        >
          {/* Top Gold Bar */}
          <div style={{ height: '3px', background: 'var(--gold-metallic)' }} />
          <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(254, 243, 199, 0.3)' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Announcements &amp; Alerts ({notifications.length})</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{ background: 'none', border: 'none', color: '#c2410c', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No active announcements right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.readStatus && markAsRead(n.id)}
                  style={{
                    padding: '0.85rem 1.15rem',
                    background: n.readStatus ? 'transparent' : 'rgba(254, 243, 199, 0.45)',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    gap: '0.65rem',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(254, 243, 199, 0.6)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = n.readStatus ? 'transparent' : 'rgba(254, 243, 199, 0.45)'}
                >
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.readStatus ? 600 : 700, fontSize: '0.84rem', color: '#0f172a' }}>{n.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', lineHeight: 1.45 }}>{n.message}</div>
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
