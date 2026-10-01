import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Landmark, Menu, X, User, LogOut, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
        {/* Brand Logo & Name */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: '#0f172a' }}>
          <div style={{ background: '#b45309', color: '#ffffff', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <Landmark size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.1, color: '#0f172a' }}>Sri Siddhivinayak</div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', letterSpacing: '0.02em' }}>Temple Management & Flow System</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link to="/" style={{ color: '#475569', fontWeight: 500, fontSize: '0.925rem' }}>Home</Link>
          <Link to="/darshan" style={{ color: '#475569', fontWeight: 500, fontSize: '0.925rem' }}>Darshan Booking</Link>
          <Link to="/crowd" style={{ color: '#475569', fontWeight: 500, fontSize: '0.925rem' }}>Crowd Status</Link>
          <Link to="/temple" style={{ color: '#475569', fontWeight: 500, fontSize: '0.925rem' }}>Temple Info</Link>
          <Link to="/help" style={{ color: '#475569', fontWeight: 500, fontSize: '0.925rem' }}>Help & SOS</Link>

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
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
