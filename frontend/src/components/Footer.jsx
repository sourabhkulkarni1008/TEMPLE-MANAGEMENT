import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useDevice } from '../utils/useDevice';

const Footer = () => {
  const { isMobile } = useDevice();

  return (
    <footer 
      style={{ 
        background: 'linear-gradient(180deg, #ffffff 0%, #fcfbf8 100%)', 
        borderTop: '1px solid rgba(245, 158, 11, 0.25)', 
        position: 'relative',
        padding: isMobile ? '2.5rem 0 6rem' : '3.5rem 0 1.75rem', 
        marginTop: 'auto' 
      }}
    >
      {/* Top Gold Gradient Filament */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, #f59e0b 20%, #ea580c 50%, #f59e0b 80%, transparent 100%)' }} />

      <div className="container">
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr 1fr 1.2fr', 
            gap: isMobile ? '2rem' : '2.5rem', 
            marginBottom: '2.5rem' 
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.35))' }}>
                <img src="/assets/images/siddhivinayak_logo.svg" alt="Siddhivinayak Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem' }}>
                  Shree Siddhivinayak Temple
                </h4>
                <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Smart Pilgrim Flow System
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: '#475569' }}>
              Sacred pilgrim management portal with live computer vision crowd monitoring, verified biometric QR gates, automated queue pacing, and 24/7 devotee safety assistance.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.98rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Pilgrim Services
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.88rem', lineHeight: 2.1 }}>
              <li><Link to="/darshan" style={{ color: '#475569', transition: 'color 0.15s ease' }}>Online Darshan Booking</Link></li>
              <li><Link to="/crowd" style={{ color: '#475569', transition: 'color 0.15s ease' }}>Live CCTV Crowd Density Map</Link></li>
              <li><Link to="/temple" style={{ color: '#475569', transition: 'color 0.15s ease' }}>Daily Pooja &amp; Aarti Timings</Link></li>
              <li><Link to="/help" style={{ color: '#475569', transition: 'color 0.15s ease' }}>Lost &amp; Found / Emergency Help</Link></li>
            </ul>
          </div>

          {/* Staff & Administration: Exclusively rendered on Desktop */}
          {!isMobile && (
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.98rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Staff &amp; Governance
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.88rem', lineHeight: 2.1 }}>
                <li><Link to="/staff/login" style={{ color: '#475569' }}>Staff Duty &amp; QR Scanner Gate</Link></li>
                <li><Link to="/admin/login" style={{ color: '#475569' }}>Executive Temple Administration</Link></li>
                <li><Link to="/admin/crowd" style={{ color: '#475569' }}>AI Crowd Telemetry Console</Link></li>
                <li><Link to="/help" style={{ color: '#475569' }}>Incident Response Desk</Link></li>
              </ul>
            </div>
          )}

          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.98rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Temple Administration
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <p style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#475569' }}>
                <MapPin size={16} color="#c2410c" style={{ flexShrink: 0 }} /> Hill Shrine Campus, Devgiri Road
              </p>
              <div style={{ 
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', 
                border: '1px solid #fde68a', 
                padding: '0.75rem 1rem', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Phone size={16} color="#b45309" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>24/7 Helpline &amp; SOS</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#78350f' }}>+91 98765 43210</div>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#475569' }}>
                <Mail size={16} color="#c2410c" style={{ flexShrink: 0 }} /> support@templedemo.com
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid rgba(245, 158, 11, 0.15)', 
          paddingTop: '1.25rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '0.75rem', 
          fontSize: '0.825rem', 
          color: '#64748b' 
        }}>
          <div>&copy; {new Date().getFullYear()} Shree Siddhivinayak Temple Administration &bull; Final Year B.Tech AI/ML Project</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10b981' }} />
            <span>Smart Temple Management &amp; Pilgrim Flow System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
