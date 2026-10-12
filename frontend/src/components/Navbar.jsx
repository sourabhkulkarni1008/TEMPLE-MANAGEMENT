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
  ShieldCheck, HelpCircle
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
    if (isMobile) {
      // On mobile, always stay in pilgrim domain
      return '/user/dashboard';
    }
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
            <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
              <img 
                src="/assets/images/siddhivinayak_logo.svg" 
                alt="Shree Siddhivinayak Temple Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(217, 119, 6, 0.45))', borderRadius: '50%' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#0f172a', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
                Shree Siddhivinayak
              </div>
              {isMobile && (
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pilgrim Portal
                </div>
              )}
            </div>
          </Link>

          {/* Right Action Icons & Menus */}
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

            {/* Notifications (Desktop & Mobile) */}
            <NotificationBell />

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: '0.5rem' }} className="desktop-nav">
                <Link to="/" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Home</Link>
                <Link to="/darshan" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Darshan Booking</Link>
                <Link to="/crowd" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Live Crowd</Link>
                <Link to="/temple" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Temple Info</Link>
                <Link to="/help" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Help &amp; SOS</Link>

                {/* Auth Buttons on Desktop */}
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
            )}

            {/* Mobile Hamburger Toggle (Shown only on Mobile/Tablet) */}
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="Toggle navigation menu"
                style={{
                  background: mobileMenuOpen ? '#fef3c7' : '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: mobileMenuOpen ? '#b45309' : '#0f172a',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE PILGRIM NAVIGATION DRAWER */}
      {isMobile && mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
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
              boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem 1rem',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img 
                  src="/assets/images/siddhivinayak_logo.svg" 
                  alt="Temple Logo" 
                  style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Siddhivinayak</div>
                  <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>PILGRIM SERVICES</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Devotee Profile Header (If Authenticated) */}
            {isAuthenticated ? (
              <div style={{ padding: '0.85rem', background: '#fffbeb', borderRadius: '10px', margin: '1rem 0 0.5rem', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#b45309', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {user?.name ? user.name[0].toUpperCase() : 'P'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#78350f' }}>
                      Pilgrim Account &bull; {user?.phone || 'Devotee'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', margin: '1.25rem 0 0.75rem' }}>
                <Link 
                  to="/login" 
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: '0.6rem 0', fontWeight: 600, borderRadius: '8px' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, padding: '0.6rem 0', fontWeight: 600, borderRadius: '8px', background: '#b45309' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Pilgrim Links List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.75rem', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.5rem 0.25rem' }}>
                Pilgrim Experience
              </div>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: location.pathname === '/' ? '#b45309' : '#334155',
                  background: location.pathname === '/' ? '#fef3c7' : 'transparent',
                  fontWeight: location.pathname === '/' ? 600 : 500,
                  fontSize: '0.9rem'
                }}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>

              <Link
                to={isAuthenticated ? '/user/book-darshan' : '/darshan'}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: location.pathname === '/darshan' || location.pathname === '/user/book-darshan' ? '#b45309' : '#334155',
                  background: location.pathname === '/darshan' || location.pathname === '/user/book-darshan' ? '#fef3c7' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem'
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      color: location.pathname === '/user/dashboard' ? '#b45309' : '#334155',
                      background: location.pathname === '/user/dashboard' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/user/dashboard' ? 600 : 500,
                      fontSize: '0.9rem'
                    }}
                  >
                    <Sparkles size={18} />
                    <span>Pilgrim Dashboard</span>
                  </Link>

                  <Link
                    to="/user/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      color: location.pathname === '/user/bookings' ? '#b45309' : '#334155',
                      background: location.pathname === '/user/bookings' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/user/bookings' ? 600 : 500,
                      fontSize: '0.9rem'
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>My QR Passes &amp; Bookings</span>
                  </Link>
                </>
              )}

              <Link
                to="/crowd"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: location.pathname === '/crowd' ? '#b45309' : '#334155',
                  background: location.pathname === '/crowd' ? '#fef3c7' : 'transparent',
                  fontWeight: location.pathname === '/crowd' ? 600 : 500,
                  fontSize: '0.9rem'
                }}
              >
                <Eye size={18} />
                <span>Live Crowd Status</span>
              </Link>

              <Link
                to="/temple"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: location.pathname === '/temple' ? '#b45309' : '#334155',
                  background: location.pathname === '/temple' ? '#fef3c7' : 'transparent',
                  fontWeight: location.pathname === '/temple' ? 600 : 500,
                  fontSize: '0.9rem'
                }}
              >
                <MapPin size={18} />
                <span>Temple Info &amp; Pooja Timings</span>
              </Link>

              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.75rem 0.5rem 0.25rem' }}>
                Devotee Support &amp; Safety
              </div>

              {isAuthenticated && (
                <>
                  <Link
                    to="/user/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      color: location.pathname === '/user/profile' ? '#b45309' : '#334155',
                      background: location.pathname === '/user/profile' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/user/profile' ? 600 : 500,
                      fontSize: '0.9rem'
                    }}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/user/lost-found"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      color: location.pathname === '/user/lost-found' ? '#b45309' : '#334155',
                      background: location.pathname === '/user/lost-found' ? '#fef3c7' : 'transparent',
                      fontWeight: location.pathname === '/user/lost-found' ? 600 : 500,
                      fontSize: '0.9rem'
                    }}
                  >
                    <Package size={18} />
                    <span>Lost &amp; Found</span>
                  </Link>
                </>
              )}

              <Link
                to={isAuthenticated ? '/user/emergency' : '/help'}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  color: '#dc2626',
                  background: '#fef2f2',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <AlertTriangle size={18} color="#dc2626" />
                <span>Emergency SOS &amp; Help</span>
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
