import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherMainLayout from '../components/teacher/layout/TeacherMainLayout';
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherCourses from '../pages/teacher/Courses';
import TeacherCourseDetails from '../pages/teacher/CourseDetails';
import TeacherMaterials from '../pages/teacher/Materials';
import TeacherAssignments from '../pages/teacher/Assignments';
import TeacherGrading from '../pages/teacher/Grading';
import TeacherAnalytics from '../pages/teacher/Analytics';
import UploadMaterialPage from '../pages/teacher/UploadMaterialPage';
import GradeSubmissionsPage from '../pages/teacher/GradeSubmissionsPage';

const TeacherRoutes = () => {
  return (
    <TeacherMainLayout>
      <Routes>
        {/* Relative paths — mounted under /teacher/* in App.jsx */}
        <Route path="dashboard"    element={<TeacherDashboard />} />
        <Route path="courses"      element={<TeacherCourses />} />
        <Route path="courses/:courseId" element={<TeacherCourseDetails />} />
        <Route path="materials"    element={<TeacherMaterials />} />
        <Route path="assignments"  element={<TeacherAssignments />} />
        <Route path="grading"      element={<TeacherGrading />} />
        <Route path="analytics"    element={<TeacherAnalytics />} />
        <Route path="materials/upload" element={<UploadMaterialPage />} />
        <Route path="assignments/:id/grade" element={<GradeSubmissionsPage />} />
        {/* Catch-all → default teacher page */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </TeacherMainLayout>
  );
};

export default TeacherRoutes;
