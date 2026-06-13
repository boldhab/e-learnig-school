import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const dashboardByRole = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  instructor: '/teacher/dashboard',
  parent: '/parent/dashboard',
  student: '/student/dashboard',
};

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  const role = (user?.role || user?.type || '').toLowerCase();
  const canAccess =
    allowedRoles.length === 0 ||
    allowedRoles.map((allowedRole) => allowedRole.toLowerCase()).includes(role);

  if (!canAccess) {
    return <Navigate to={dashboardByRole[role] || '/student/dashboard'} replace />;
  }

  return children;
};

export default PrivateRoute;
