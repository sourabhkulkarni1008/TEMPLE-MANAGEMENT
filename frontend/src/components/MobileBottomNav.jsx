import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../utils/useDevice';
import { 
  Home, CalendarCheck, QrCode, User, ListOrdered, 
  AlertTriangle, Eye, LayoutDashboard 
} from 'lucide-react';

const MobileBottomNav = () => {
  const { isMobile } = useDevice();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isMobile) return null;

  const getNavItems = () => {
    if (isAuthenticated && user?.role === 'STAFF') {
      return [
        {
          to: '/staff/dashboard',
          label: 'Overview',
          icon: LayoutDashboard,
          isActive: location.pathname === '/staff/dashboard'
        },
        {
          to: '/staff/qr-scanner',
          label: 'Scanner',
          icon: QrCode,
          isActive: location.pathname === '/staff/qr-scanner'
        },
        {
          to: '/staff/queue',
          label: 'Queue',
          icon: ListOrdered,
          isActive: location.pathname === '/staff/queue'
        },
        {
          to: '/staff/emergency',
          label: 'SOS Alert',
          icon: AlertTriangle,
          isActive: location.pathname === '/staff/emergency',
          isDanger: true
        }
      ];
    }

    if (isAuthenticated && user?.role === 'ADMIN') {
      return [
        {
          to: '/admin/dashboard',
          label: 'Overview',
          icon: LayoutDashboard,
          isActive: location.pathname === '/admin/dashboard'
        },
        {
          to: '/admin/darshan',
          label: 'Slots',
          icon: CalendarCheck,
          isActive: location.pathname === '/admin/darshan'
        },
        {
          to: '/admin/crowd',
          label: 'Crowd',
          icon: Eye,
          isActive: location.pathname === '/admin/crowd'
        },
        {
          to: '/admin/queue',
          label: 'Queue',
          icon: ListOrdered,
          isActive: location.pathname === '/admin/queue'
        }
      ];
    }

    return [
      {
        to: '/',
        label: 'Home',
        icon: Home,
        isActive: location.pathname === '/'
      },
      {
        to: isAuthenticated ? '/user/book-darshan' : '/darshan',
        label: 'Darshan',
        icon: CalendarCheck,
        isActive: location.pathname === '/darshan' || location.pathname === '/user/book-darshan'
      },
      {
        to: isAuthenticated ? '/user/bookings' : '/login',
        label: 'Bookings',
        icon: QrCode,
        isActive: location.pathname.startsWith('/user/booking')
      },
      {
        to: isAuthenticated ? '/user/profile' : '/login',
        label: isAuthenticated ? 'Profile' : 'Login',
        icon: User,
        isActive: location.pathname === '/user/profile' || location.pathname === '/login' || location.pathname === '/register'
      }
    ];
  };

  const navItems = getNavItems();

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '66px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(245, 158, 11, 0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 90,
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08), 0 0 10px rgba(245, 158, 11, 0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* Top Gold Accent Line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: 'linear-gradient(90deg, transparent 0%, #f59e0b 25%, #ff7a00 50%, #f59e0b 75%, transparent 100%)' }} />

      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive;
        return (
          <NavLink
            key={item.label}
            to={item.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              minHeight: '48px',
              textDecoration: 'none',
              color: item.isDanger ? (active ? '#dc2626' : '#ef4444') : (active ? '#c2410c' : '#64748b'),
              fontWeight: active ? 800 : 500,
              fontSize: '0.725rem',
              gap: '3px',
              transition: 'all 0.18s ease'
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '28px',
                borderRadius: '14px',
                background: active 
                  ? (item.isDanger ? 'linear-gradient(135deg, #fee2e2, #fecaca)' : 'linear-gradient(135deg, #fffbeb, #fef3c7)') 
                  : 'transparent',
                border: active 
                  ? (item.isDanger ? '1px solid #f87171' : '1px solid #fde68a') 
                  : '1px solid transparent',
                boxShadow: active ? '0 2px 8px rgba(245, 158, 11, 0.2)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              <Icon size={19} strokeWidth={active ? 2.6 : 1.9} color={item.isDanger ? (active ? '#b91c1c' : '#ef4444') : (active ? '#c2410c' : '#64748b')} />
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
