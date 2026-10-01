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
      <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
          {role} PORTAL
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.925rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.name}
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#b45309' : '#475569',
                backgroundColor: isActive ? '#fef3c7' : 'transparent',
                textDecoration: 'none'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
