import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const DesktopOnlyNotice = () => {
  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
        <div 
          style={{ 
            display: 'inline-flex', 
            background: '#fef3c7', 
            color: '#b45309', 
            padding: '16px', 
            borderRadius: '50%', 
            marginBottom: '1rem',
            border: '2px solid #fde68a'
          }}
        >
          <Monitor size={36} />
        </div>

        <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '0.75rem' }}>
          Desktop Access Required
        </h2>

        <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Staff duty rosters, token gate scanners, and Administrative management consoles are strictly restricted to <strong>desktop and laptop computers</strong>.
        </p>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.75rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Sparkles size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <strong>Devotee Services:</strong> All Pilgrim features (Darshan booking, live queue vision, digital QR passes, and temple guidelines) are fully optimized for your mobile device.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}>
            <span>Go to Pilgrim Portal</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/darshan" className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>
            <span>Book Darshan Pass</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DesktopOnlyNotice;
