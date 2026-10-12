import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../utils/useDevice';
import { Home, CalendarCheck, QrCode, User } from 'lucide-react';

const MobileBottomNav = () => {
  const { isMobile } = useDevice();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isMobile) return null;

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      isActive: location.pathname === '/'
    },
    {
      to: isAuthenticated ? '/user/book-darshan' : '/darshan',
      label: 'Book Slot',
      icon: CalendarCheck,
      isActive: location.pathname === '/darshan' || location.pathname === '/user/book-darshan'
    },
    {
      to: isAuthenticated ? '/user/bookings' : '/login',
      label: 'My Passes',
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

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 90,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
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
              textDecoration: 'none',
              color: active ? '#b45309' : '#64748b',
              fontWeight: active ? 600 : 500,
              fontSize: '0.725rem',
              gap: '3px',
              transition: 'color 0.15s ease'
            }}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '24px',
                borderRadius: '12px',
                background: active ? '#fef3c7' : 'transparent',
                transition: 'background-color 0.15s ease'
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
