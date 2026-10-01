import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, badgeText, badgeType = 'info' }) => {
  return (
    <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{title}</span>
        {Icon && (
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
        {(subtext || badgeText) && (
          <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
            {badgeText && (
              <span className={`badge badge-${badgeType}`} style={{ padding: '1px 6px', fontSize: '0.7rem' }}>
                {badgeText}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
