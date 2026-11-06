import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  QrCode,
  Users,
  Eye,
  ListOrdered,
  AlertTriangle,
  Sparkles,
  Search,
  Bell,
  FileText,
  Settings,
  UserCheck,
  Package
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getLinks = () => {
    if (role === 'PILGRIM') {
      return [
        { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/user/book-darshan', label: 'Book Darshan', icon: CalendarCheck },
        { to: '/user/bookings', label: 'My Bookings', icon: QrCode },
        { to: '/user/emergency', label: 'Emergency SOS', icon: AlertTriangle },
        { to: '/user/lost-found', label: 'Lost & Found', icon: Package },
        { to: '/user/profile', label: 'My Profile', icon: Settings }
      ];
    }

    if (role === 'STAFF') {
      return [
        { to: '/staff/dashboard', label: 'Staff Overview', icon: LayoutDashboard },
        { to: '/staff/qr-scanner', label: 'QR Token Scanner', icon: QrCode },
        { to: '/staff/queue', label: 'Queue Control', icon: ListOrdered },
        { to: '/staff/emergency', label: 'Emergency Response', icon: AlertTriangle },
        { to: '/staff/tasks', label: 'My Shift Duties', icon: UserCheck }
      ];
    }

    if (role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
        { to: '/admin/darshan', label: 'Darshan Slots & Quotas', icon: CalendarCheck },
        { to: '/admin/crowd', label: 'CCTV Crowd Monitor', icon: Eye },
        { to: '/admin/queue', label: 'Queue Management', icon: ListOrdered },
        { to: '/admin/users', label: 'Pilgrim Directory', icon: Users },
        { to: '/admin/staff', label: 'Staff Roster', icon: UserCheck },
        { to: '/admin/festivals', label: 'Festival Mode', icon: Sparkles },
        { to: '/admin/emergency', label: 'Emergency Incidents', icon: AlertTriangle },
        { to: '/admin/lost-found', label: 'Lost & Found Desk', icon: Search },
        { to: '/admin/notifications', label: 'Announcements', icon: Bell },
        { to: '/admin/reports', label: 'Analytics & Reports', icon: FileText },
        { to: '/admin/settings', label: 'System Settings', icon: Settings }
      ];
    }

    return [];
  };

  const links = getLinks();

  return (
    <aside className="sidebar">
      {/* User Session & Role Card */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '0.85rem', 
        background: 'linear-gradient(135deg, rgba(255, 251, 235, 0.8) 0%, rgba(254, 243, 199, 0.5) 100%)', 
        border: '1px solid rgba(245, 158, 11, 0.25)', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '50%', 
            background: 'var(--saffron-gradient)', 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 800, 
            fontSize: '1rem',
            boxShadow: '0 2px 6px rgba(249, 115, 22, 0.3)'
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10b981' }}></span>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#c2410c', fontWeight: 800, letterSpacing: '0.05em' }}>
                {role} PORTAL
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.65rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#c2410c' : '#475569',
                backgroundColor: isActive ? 'rgba(254, 243, 199, 0.75)' : 'transparent',
                borderLeft: isActive ? '3px solid #ea580c' : '3px solid transparent',
                boxShadow: isActive ? '0 2px 6px rgba(245, 158, 11, 0.12)' : 'none',
                textDecoration: 'none',
                transition: 'all 0.18s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} color={isActive ? '#c2410c' : '#64748b'} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
