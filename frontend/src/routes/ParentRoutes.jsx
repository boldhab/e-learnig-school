import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ParentMainLayout from '../components/layout/ParentMainLayout';

const ParentDashboard = lazy(() => import('../pages/parent/ParentDashboard'));
const ChildCourses = lazy(() => import('../pages/parent/ChildCourses'));
const ChildAssignments = lazy(() => import('../pages/parent/ChildAssignments'));
const ChildAttendance = lazy(() => import('../pages/parent/ChildAttendance'));
const ChildPerformance = lazy(() => import('../pages/parent/ChildPerformance'));
const ChildReports = lazy(() => import('../pages/parent/ChildReports'));
const ParentNotifications = lazy(() => import('../pages/parent/ParentNotifications'));

const ParentRoutes = () => {
  return (
    <Routes>
      <Route element={<ParentMainLayout />}>
        <Route path="dashboard" element={<ParentDashboard />} />
        {/* Overview page removed from parent routes */}
        <Route path="student/:id/courses" element={<ChildCourses />} />
        <Route path="student/:id/assignments" element={<ChildAssignments />} />
        <Route path="student/:id/attendance" element={<ChildAttendance />} />
        <Route path="student/:id/reports" element={<ChildReports />} />
        <Route path="student/:id/performance" element={<ChildPerformance />} />
        <Route path="notifications" element={<ParentNotifications />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default ParentRoutes;
