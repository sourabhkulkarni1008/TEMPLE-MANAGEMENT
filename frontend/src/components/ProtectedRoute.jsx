import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../utils/useDevice';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const { isMobile } = useDevice();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Loading session authentication...</p>
      </div>
    );
  }

  // Mobile restriction: Staff and Admin interfaces are strictly restricted to desktop workstations
  if (isMobile && !allowedRoles.includes('PILGRIM')) {
    return <Navigate to="/desktop-required" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to proper role dashboard
    if (user.role === 'ADMIN') return <Navigate to={isMobile ? "/desktop-required" : "/admin/dashboard"} replace />;
    if (user.role === 'STAFF') return <Navigate to={isMobile ? "/desktop-required" : "/staff/dashboard"} replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
