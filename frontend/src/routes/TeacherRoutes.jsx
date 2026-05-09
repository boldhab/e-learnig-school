import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherMainLayout from '../components/teacher/layout/TeacherMainLayout';
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherCourses from '../pages/teacher/Courses';
import TeacherMaterials from '../pages/teacher/Materials';
import TeacherAssignments from '../pages/teacher/Assignments';
import TeacherGrading from '../pages/teacher/Grading';
import TeacherAnalytics from '../pages/teacher/Analytics';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route element={<TeacherMainLayout><TeacherDashboard /></TeacherMainLayout>} path="/teacher/dashboard" />
      <Route element={<TeacherMainLayout><TeacherCourses /></TeacherMainLayout>} path="/teacher/courses" />
      <Route element={<TeacherMainLayout><TeacherMaterials /></TeacherMainLayout>} path="/teacher/materials" />
      <Route element={<TeacherMainLayout><TeacherAssignments /></TeacherMainLayout>} path="/teacher/assignments" />
      <Route element={<TeacherMainLayout><TeacherGrading /></TeacherMainLayout>} path="/teacher/grading" />
      <Route element={<TeacherMainLayout><TeacherAnalytics /></TeacherMainLayout>} path="/teacher/analytics" />
      {/* Submission, Discussions, Live Classes, Attendance, Notifications, Profile - Coming Soon */}
      <Route path="/teacher/*" element={<Navigate to="/teacher/dashboard" replace />} />
    </Routes>
  );
};

export default TeacherRoutes;
