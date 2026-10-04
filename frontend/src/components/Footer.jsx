import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Shield, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '2.5rem 0 1.5rem', marginTop: 'auto' }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src="/assets/images/siddhivinayak_logo.svg" alt="Siddhivinayak Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Shree Siddhivinayak Temple</h4>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              Smart pilgrim flow, verified QR entry passes, automated queue regulation, and real-time CCTV crowd monitoring.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Pilgrim Services</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', lineHeight: 1.8 }}>
              <li><Link to="/darshan">Online Darshan Booking</Link></li>
              <li><Link to="/crowd">Live Crowd Density Map</Link></li>
              <li><Link to="/temple">Daily Pooja & Aarti Timings</Link></li>
              <li><Link to="/help">Lost & Found / Emergency Help</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Staff & Administration</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', lineHeight: 1.8 }}>
              <li><Link to="/staff/login">Staff Entry Portal & QR Scanner</Link></li>
              <li><Link to="/admin/login">Temple Executive Admin Login</Link></li>
              <li><Link to="/help">Incident Reporting Desk</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Temple Administration</h4>
            <p style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <MapPin size={15} color="#b45309" /> Hill Shrine Campus, Devgiri Road
            </p>
            <p style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Phone size={15} color="#b45309" /> +91 98765 43210 (24/7 Helpline)
            </p>
            <p style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={15} color="#b45309" /> support@templedemo.com
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
          <div>&copy; {new Date().getFullYear()} Sri Siddhivinayak Temple Administration &bull; Final Year B.Tech AI/ML Project</div>
          <div>Smart Temple Management &amp; Pilgrim Flow System</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
