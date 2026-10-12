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

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#ffffff',
        borderTop: '1px solid #f1e5d1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 90,
        boxShadow: '0 -3px 14px rgba(112, 26, 40, 0.05)',
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
              minHeight: '48px',
              textDecoration: 'none',
              color: active ? '#b45309' : '#78716c',
              fontWeight: active ? 700 : 500,
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
                width: '36px',
                height: '26px',
                borderRadius: '13px',
                background: active ? '#fef3c7' : 'transparent',
                transition: 'background-color 0.15s ease'
              }}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 1.9} />
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
