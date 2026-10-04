import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import CommandPalette from './CommandPalette';
import { audioService } from '../utils/audioService';
import { 
  Landmark, Menu, X, User, LogOut, ShieldAlert, 
  Search, Bell, Sparkles, Box, QrCode
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'STAFF') return '/staff/dashboard';
    return '/user/dashboard';
  };

  return (
    <>
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '68px' }}>
          {/* Brand Logo & Name */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#0f172a' }}>
            <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
              <img 
                src="/assets/images/siddhivinayak_logo.svg" 
                alt="Shree Siddhivinayak Temple Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(217, 119, 6, 0.45))', borderRadius: '50%' }}
              />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
              Shree Siddhivinayak
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Sacred Bell Chime trigger */}
            <button
              onClick={() => audioService.playTempleBell(1.0)}
              title="Ring Temple Bell (Audio Chime)"
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                padding: '7px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Bell size={16} />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
            <Link to="/" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Home</Link>
            <Link to="/darshan" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Darshan Booking</Link>
            <Link to="/crowd" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Live Crowd</Link>
            <Link to="/temple" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Temple Info</Link>
            <Link to="/help" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Help &amp; SOS</Link>

            {/* Notifications */}
            <NotificationBell />

            {/* Auth Button */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to={getDashboardLink()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={15} />
                  <span>{user.name.split(' ')[0]} ({user.role})</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-sm" style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #b45309, #78350f)' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Global Command Palette Component */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
};

export default Navbar;
