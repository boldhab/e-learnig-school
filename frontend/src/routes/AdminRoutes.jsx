import { Routes, Route, Navigate } from 'react-router-dom';
import AdminMainLayout from '../components/admin/layout/AdminMainLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import ManageUsersPage from '../pages/admin/ManageUsersPage';
import ManageCoursesPage from '../pages/admin/ManageCoursesPage';
import AdminCourseDetailsPage from '../pages/admin/AdminCourseDetailsPage';
import AdminClassDetailsPage from '../pages/admin/AdminClassDetailsPage';
import AssignmentsOverviewPage from '../pages/admin/AssignmentsOverviewPage';
import DiscussionsMonitoringPage from '../pages/admin/DiscussionsMonitoringPage';
import AttendanceReportsPage from '../pages/admin/AttendanceReportsPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import NotificationsPage from '../pages/admin/NotificationsPage';
import SystemSettingsPage from '../pages/admin/SystemSettingsPage';
import BackupPage from '../pages/admin/BackupPage';
import ActivityLogsPage from '../pages/admin/ActivityLogsPage';
import ProfilePage from '../pages/admin/ProfilePage';

const AdminRoutes = () => (
  <AdminMainLayout>
    <Routes>
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="users" element={<ManageUsersPage defaultRole="all" />} />
      <Route path="teachers" element={<ManageUsersPage defaultRole="teacher" />} />
      <Route path="students" element={<ManageUsersPage defaultRole="student" />} />
      <Route path="courses" element={<ManageCoursesPage />} />
      <Route path="courses/:courseId" element={<AdminCourseDetailsPage />} />
      <Route path="courses/departments/:departmentId/classes/:classId" element={<AdminClassDetailsPage />} />
      <Route path="courses/classes/:classId" element={<AdminClassDetailsPage />} />
      <Route path="assignments" element={<AssignmentsOverviewPage />} />
      <Route path="discussions" element={<DiscussionsMonitoringPage />} />
      <Route path="attendance" element={<AttendanceReportsPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="settings" element={<SystemSettingsPage />} />
      <Route path="backups" element={<BackupPage />} />
      <Route path="activity-logs" element={<ActivityLogsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  </AdminMainLayout>
);

export default AdminRoutes;
