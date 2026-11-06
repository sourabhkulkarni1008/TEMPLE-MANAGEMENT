import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const DesktopOnlyNotice = () => {
  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem 1rem' }}>
      <div className="card card-gold-trim glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
        <div 
          style={{ 
            display: 'inline-flex', 
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%)', 
            color: '#16a34a', 
            padding: '16px', 
            borderRadius: '50%', 
            marginBottom: '1rem',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.15)'
          }}
        >
          <ShieldCheck size={36} />
        </div>

        <h2 className="temple-gradient-text" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Mobile Access Fully Enabled
        </h2>

        <p style={{ fontSize: '0.925rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          All Pilgrim bookings, Staff gate QR scanning, and Admin command dashboards are 100% responsive across smartphones, tablets, and desktops.
        </p>

        <div style={{ background: 'rgba(248, 250, 252, 0.8)', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.75rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Sparkles size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
              <strong>Handheld Optimized:</strong> Staff officers can verify QR passes directly using phone cameras at entry turnstiles, view live queue density, and respond to SOS requests on the go.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: 700, borderRadius: '8px', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)' }}>
            <span>Go to Home Portal &rarr;</span>
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', fontWeight: 600 }}>
            <span>Sign In to Role Console</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DesktopOnlyNotice;
