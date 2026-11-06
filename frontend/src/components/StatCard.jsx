import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, badgeText, badgeType = 'info' }) => {
  return (
    <div 
      className="card card-gold-trim" 
      style={{ 
        marginBottom: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</span>
        {Icon && (
          <div style={{ 
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', 
            color: '#c2410c', 
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '8px', 
            borderRadius: '10px', 
            display: 'flex',
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, fontFamily: 'Outfit, sans-serif' }}>
          {value}
        </div>
        {(subtext || badgeText) && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
            {badgeText && (
              <span className={`badge badge-${badgeType}`} style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                {badgeText}
              </span>
            )}
            {subtext && <span style={{ fontWeight: 500 }}>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
