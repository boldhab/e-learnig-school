import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/student/Dashboard';
import Courses from '../pages/student/Courses';
import Assignments from '../pages/student/Assignments';
import Submissions from '../pages/student/Submissions';
import Discussions from '../pages/student/Discussions';
import Grades from '../pages/student/Grades';
import Attendance from '../pages/student/Attendance';
import Notifications from '../pages/student/Notifications';
import GuidePage from '../pages/student/GuidePage';

const StudentRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="discussions" element={<Discussions />} />
        <Route path="grades" element={<Grades />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default StudentRoutes;
