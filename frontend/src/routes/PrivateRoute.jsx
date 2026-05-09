import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PrivateRoute — protects routes behind authentication + optional role check.
 *
 * Usage:
 *   <PrivateRoute allowedRoles={['student']}><StudentRoutes /></PrivateRoute>
 *
 * - If not authenticated → redirect to /auth/login (preserving intended URL)
 * - If authenticated but wrong role → redirect to the user's correct dashboard
 * - If authenticated and role matches (or no role required) → render children
 */
const ROLE_DASHBOARDS = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  instructor: '/teacher/dashboard',
  student: '/student/dashboard',
};

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. Not logged in → go to login, remember where they were trying to go
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Role check (only when specific roles are required)
  if (allowedRoles.length > 0) {
    const userRole = (user?.role || user?.type || '').toLowerCase();
    const hasRole = allowedRoles.includes(userRole);

    if (!hasRole) {
      // Redirect to the user's own dashboard rather than showing an error
      const correctDashboard = ROLE_DASHBOARDS[userRole] || '/auth/login';
      return <Navigate to={correctDashboard} replace />;
    }
  }

  // 3. All good — render the protected content
  return children;
};

export default PrivateRoute;
