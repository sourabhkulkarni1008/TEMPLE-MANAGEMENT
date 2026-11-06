import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../utils/useDevice';
import NotificationBell from './NotificationBell';
import CommandPalette from './CommandPalette';
import { audioService } from '../utils/audioService';
import { 
  Menu, X, User, LogOut, Bell, Sparkles, 
  CalendarCheck, Eye, MapPin, AlertTriangle, Package, Home,
  ShieldCheck, HelpCircle, QrCode, ListOrdered, Settings, UserCheck, FileText, Users, Search
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isMobile } = useDevice();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
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
      <nav style={{ 
        background: 'rgba(255, 255, 255, 0.88)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)', 
        borderBottom: '1px solid rgba(245, 158, 11, 0.22)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(245, 158, 11, 0.08)' 
      }}>
        {/* Subtle Gold Accent Filigree Line */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, #f59e0b 25%, #ff7a00 50%, #f59e0b 75%, transparent 100%)' }} />
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '68px' }}>
          {/* Brand Logo & Name */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', color: '#0f172a' }}>
            <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
              <img 
                src="/assets/images/siddhivinayak_logo.svg" 
                alt="Shree Siddhivinayak Temple Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 3px 10px rgba(249, 115, 22, 0.45))', borderRadius: '50%' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: isMobile ? '1.12rem' : '1.3rem', color: '#0f172a', fontFamily: 'Outfit, sans-serif', lineHeight: 1.15, letterSpacing: '-0.015em' }}>
                Shree Siddhivinayak
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#f59e0b' }}></span>
                {isMobile ? (user?.role === 'ADMIN' ? 'Admin Portal' : user?.role === 'STAFF' ? 'Staff Portal' : 'Pilgrim Portal') : 'Divine Darshan & Pilgrim Flow System'}
              </div>
            </div>
          </Link>

          {/* Right Action Icons & Menus */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Command Palette (Ctrl+K) Trigger Button */}
            {!isMobile && (
              <button
                onClick={() => setPaletteOpen(true)}
                title="Open Command Palette (Ctrl+K)"
                style={{
                  background: 'rgba(254, 243, 199, 0.5)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#92400e',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef3c7'; e.currentTarget.style.borderColor = '#f59e0b'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(254, 243, 199, 0.5)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)'; }}
              >
                <Search size={13} />
                <span>Search</span>
                <kbd style={{ background: '#ffffff', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fde68a', fontSize: '0.7rem', color: '#b45309' }}>⌘K</kbd>
              </button>
            )}

            {/* Sacred Bell Chime trigger */}
            <button
              onClick={() => audioService.playTempleBell(1.0)}
              title="Ring Temple Bell (Audio Chime)"
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1px solid #fde68a',
                color: '#b45309',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.2)'; }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
            >
              <Bell size={16} />
            </button>

            {/* Notifications (Desktop & Mobile) */}
            <NotificationBell />

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: '0.6rem' }} className="desktop-nav">
                <Link 
                  to="/" 
                  style={{ 
                    color: location.pathname === '/' ? '#c2410c' : '#334155', 
                    fontWeight: location.pathname === '/' ? 700 : 600, 
                    fontSize: '0.91rem',
                    position: 'relative',
                    padding: '4px 0'
                  }}
                >
                  Home
                  {location.pathname === '/' && (
                    <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: '2px', background: 'var(--saffron-gradient)', borderRadius: '2px' }} />
                  )}
                </Link>
                <Link 
                  to="/darshan" 
                  style={{ 
                    color: location.pathname.startsWith('/darshan') ? '#c2410c' : '#334155', 
                    fontWeight: location.pathname.startsWith('/darshan') ? 700 : 600, 
                    fontSize: '0.91rem',
                    position: 'relative',
                    padding: '4px 0'
                  }}
                >
                  Darshan Booking
                  {location.pathname.startsWith('/darshan') && (
                    <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: '2px', background: 'var(--saffron-gradient)', borderRadius: '2px' }} />
                  )}
                </Link>
                <Link 
                  to="/crowd" 
                  style={{ 
                    color: location.pathname.startsWith('/crowd') ? '#c2410c' : '#334155', 
                    fontWeight: location.pathname.startsWith('/crowd') ? 700 : 600, 
                    fontSize: '0.91rem',
                    position: 'relative',
                    padding: '4px 0'
                  }}
                >
                  Live Crowd
                  {location.pathname.startsWith('/crowd') && (
                    <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: '2px', background: 'var(--saffron-gradient)', borderRadius: '2px' }} />
                  )}
                </Link>
                <Link 
                  to="/temple" 
                  style={{ 
                    color: location.pathname.startsWith('/temple') ? '#c2410c' : '#334155', 
                    fontWeight: location.pathname.startsWith('/temple') ? 700 : 600, 
                    fontSize: '0.91rem',
                    position: 'relative',
                    padding: '4px 0'
                  }}
                >
                  Temple Guide
                  {location.pathname.startsWith('/temple') && (
                    <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: '2px', background: 'var(--saffron-gradient)', borderRadius: '2px' }} />
                  )}
                </Link>
                <Link 
                  to="/help" 
                  style={{ 
                    color: location.pathname.startsWith('/help') ? '#c2410c' : '#334155', 
                    fontWeight: location.pathname.startsWith('/help') ? 700 : 600, 
                    fontSize: '0.91rem',
                    position: 'relative',
                    padding: '4px 0'
                  }}
                >
                  Help &amp; SOS
                  {location.pathname.startsWith('/help') && (
                    <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: '2px', background: 'var(--saffron-gradient)', borderRadius: '2px' }} />
                  )}
                </Link>

                {/* Auth Buttons on Desktop */}
                {isAuthenticated ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.25rem' }}>
                    <Link 
                      to={getDashboardLink()} 
                      className="btn btn-secondary btn-sm" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)'
                      }}
                    >
                      <User size={15} color="#c2410c" />
                      <span style={{ fontWeight: 700 }}>{user.name.split(' ')[0]}</span>
                      <span className="badge badge-low" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                        {user.role}
                      </span>
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="btn btn-sm" 
                      style={{ 
                        color: '#64748b', 
                        background: 'transparent', 
                        border: '1px solid transparent', 
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '6px'
                      }} 
                      title="Logout"
                      onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.25rem' }}>
                    <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                    <Link to="/register" className="btn btn-primary btn-sm">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle (Shown only on Mobile/Tablet) */}
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="Toggle navigation menu"
                style={{
                  background: mobileMenuOpen ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: mobileMenuOpen ? '#c2410c' : '#0f172a',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginLeft: '4px',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)'
                }}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER */}
      {isMobile && mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(6, 11, 24, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '340px',
              height: '100%',
              background: '#ffffff',
              borderLeft: '2px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '-8px 0 32px rgba(6, 11, 24, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem 1rem calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img 
                  src="/assets/images/siddhivinayak_logo.svg" 
                  alt="Temple Logo" 
                  style={{ width: '38px', height: '38px', borderRadius: '50%', filter: 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.4))' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>Siddhivinayak</div>
                  <div style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {user?.role === 'ADMIN' ? 'ADMIN EXECUTIVE CONSOLE' : user?.role === 'STAFF' ? 'STAFF GATE SCANNER PORTAL' : 'PILGRIM SACRED PORTAL'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#9a3412', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Header (If Authenticated) */}
            {isAuthenticated ? (
              <div style={{ padding: '0.85rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', borderRadius: '12px', margin: '1rem 0 0.5rem', border: '1px solid #fde68a', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--saffron-gradient)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 2px 6px rgba(249, 115, 22, 0.35)' }}>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#b45309', fontWeight: 600 }}>
                      {user?.role === 'ADMIN' ? 'Temple Administrator' : user?.role === 'STAFF' ? 'Gate Security & Staff' : 'Pilgrim Devotee'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', margin: '1.25rem 0 0.75rem' }}>
                <Link 
                  to="/login" 
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: '0.6rem 0', fontWeight: 700, borderRadius: '8px' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, padding: '0.6rem 0', fontWeight: 700, borderRadius: '8px' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Navigation Drawer Links Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.75rem', flex: 1 }}>

              {/* STAFF SPECIFIC LINKS */}
              {isAuthenticated && user?.role === 'STAFF' && (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.5rem 0.25rem' }}>
                    Staff Gate Duties
                  </div>
                  <Link
                    to="/staff/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/staff/dashboard' ? '#b45309' : '#334155',
                      background: location.pathname === '/staff/dashboard' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/staff/dashboard' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <Home size={18} />
                    <span>Staff Overview</span>
                  </Link>
                  <Link
                    to="/staff/qr-scanner"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/staff/qr-scanner' ? '#b45309' : '#334155',
                      background: location.pathname === '/staff/qr-scanner' ? '#fef3c7' : 'transparent',
                      fontWeight: 600, fontSize: '0.9rem'
                    }}
                  >
                    <QrCode size={18} color="#b45309" />
                    <span>Live QR Token Scanner</span>
                  </Link>
                  <Link
                    to="/staff/queue"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/staff/queue' ? '#b45309' : '#334155',
                      background: location.pathname === '/staff/queue' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/staff/queue' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <ListOrdered size={18} />
                    <span>Queue Line Control</span>
                  </Link>
                  <Link
                    to="/staff/emergency"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/staff/emergency' ? '#dc2626' : '#334155',
                      background: location.pathname === '/staff/emergency' ? '#fee2e2' : 'transparent',
                      fontWeight: 600, fontSize: '0.9rem'
                    }}
                  >
                    <AlertTriangle size={18} color="#dc2626" />
                    <span>Emergency Response</span>
                  </Link>
                  <Link
                    to="/staff/tasks"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/staff/tasks' ? '#b45309' : '#334155',
                      background: location.pathname === '/staff/tasks' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/staff/tasks' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <UserCheck size={18} />
                    <span>My Shift Duties</span>
                  </Link>
                </>
              )}

              {/* ADMIN SPECIFIC LINKS */}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.5rem 0.25rem' }}>
                    Executive Admin Console
                  </div>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/dashboard' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/dashboard' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/dashboard' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <Home size={18} />
                    <span>Admin Overview</span>
                  </Link>
                  <Link
                    to="/admin/darshan"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/darshan' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/darshan' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/darshan' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <CalendarCheck size={18} />
                    <span>Darshan Slots & Quotas</span>
                  </Link>
                  <Link
                    to="/admin/crowd"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/crowd' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/crowd' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/crowd' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <Eye size={18} />
                    <span>CCTV Crowd Monitor</span>
                  </Link>
                  <Link
                    to="/admin/queue"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/queue' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/queue' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/queue' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <ListOrdered size={18} />
                    <span>Queue Management</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/users' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/users' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/users' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <Users size={18} />
                    <span>Pilgrim Directory</span>
                  </Link>
                  <Link
                    to="/admin/staff"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/staff' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/staff' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/staff' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <UserCheck size={18} />
                    <span>Staff Roster</span>
                  </Link>
                  <Link
                    to="/admin/festivals"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/festivals' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/festivals' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/festivals' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <Sparkles size={18} />
                    <span>Festival Mode Controls</span>
                  </Link>
                  <Link
                    to="/admin/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/reports' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/reports' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/reports' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <FileText size={18} />
                    <span>Analytics & Reports</span>
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/admin/settings' ? '#b45309' : '#334155',
                      background: location.pathname === '/admin/settings' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/admin/settings' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <Settings size={18} />
                    <span>System Settings</span>
                  </Link>
                </>
              )}

              {/* PILGRIM SERVICES LINKS (Always available or for pilgrims) */}
              {(!isAuthenticated || user?.role === 'PILGRIM') && (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.5rem 0.25rem' }}>
                    Pilgrim Experience
                  </div>

                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/' ? '#b45309' : '#334155',
                      background: location.pathname === '/' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </Link>

                  <Link
                    to={isAuthenticated ? '/user/book-darshan' : '/darshan'}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/darshan' || location.pathname === '/user/book-darshan' ? '#b45309' : '#334155',
                      background: location.pathname === '/darshan' || location.pathname === '/user/book-darshan' ? '#fef3c7' : 'transparent',
                      fontWeight: 600, fontSize: '0.9rem'
                    }}
                  >
                    <CalendarCheck size={18} color="#b45309" />
                    <span>Online Darshan Booking</span>
                  </Link>

                  {isAuthenticated && (
                    <>
                      <Link
                        to="/user/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                          color: location.pathname === '/user/dashboard' ? '#b45309' : '#334155',
                          background: location.pathname === '/user/dashboard' ? '#fef3c7' : 'transparent',
                          fontWeight: location.pathname === '/user/dashboard' ? 600 : 500, fontSize: '0.9rem'
                        }}
                      >
                        <Sparkles size={18} />
                        <span>Pilgrim Dashboard</span>
                      </Link>

                      <Link
                        to="/user/bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                          color: location.pathname === '/user/bookings' ? '#b45309' : '#334155',
                          background: location.pathname === '/user/bookings' ? '#fef3c7' : 'transparent',
                          fontWeight: location.pathname === '/user/bookings' ? 600 : 500, fontSize: '0.9rem'
                        }}
                      >
                        <ShieldCheck size={18} />
                        <span>My QR Passes &amp; Bookings</span>
                      </Link>
                    </>
                  )}
                </>
              )}

              {/* COMMON TEMPLE INFORMATION & CROWD STATUS */}
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.75rem 0.5rem 0.25rem' }}>
                Temple Info & Safety
              </div>

              <Link
                to="/crowd"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                  color: location.pathname === '/crowd' ? '#b45309' : '#334155',
                  background: location.pathname === '/crowd' ? '#fef3c7' : 'transparent',
                  fontWeight: location.pathname === '/crowd' ? 600 : 500, fontSize: '0.9rem'
                }}
              >
                <Eye size={18} />
                <span>Live Crowd Status</span>
              </Link>

              <Link
                to="/temple"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                  color: location.pathname === '/temple' ? '#b45309' : '#334155',
                  background: location.pathname === '/temple' ? '#fef3c7' : 'transparent',
                  fontWeight: location.pathname === '/temple' ? 600 : 500, fontSize: '0.9rem'
                }}
              >
                <MapPin size={18} />
                <span>Temple Info &amp; Pooja Timings</span>
              </Link>

              {isAuthenticated && user?.role === 'PILGRIM' && (
                <>
                  <Link
                    to="/user/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/user/profile' ? '#b45309' : '#334155',
                      background: location.pathname === '/user/profile' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/user/profile' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/user/lost-found"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                      color: location.pathname === '/user/lost-found' ? '#b45309' : '#334155',
                      background: location.pathname === '/user/lost-found' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/user/lost-found' ? 600 : 500, fontSize: '0.9rem'
                    }}
                  >
                    <Package size={18} />
                    <span>Lost &amp; Found Desk</span>
                  </Link>
                </>
              )}

              <Link
                to={isAuthenticated && user?.role === 'PILGRIM' ? '/user/emergency' : '/help'}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
                  color: '#dc2626', background: '#fef2f2', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px'
                }}
              >
                <AlertTriangle size={18} color="#dc2626" />
                <span>Emergency SOS &amp; Helpline</span>
              </Link>
            </div>

            {/* Logout button at bottom of mobile drawer */}
            {isAuthenticated && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Command Palette Component */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
};

export default Navbar;
