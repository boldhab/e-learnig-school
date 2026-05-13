import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherMainLayout from '../components/teacher/layout/TeacherMainLayout';
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherCourses from '../pages/teacher/Courses';
import TeacherCourseDetails from '../pages/teacher/CourseDetails';
import TeacherMaterials from '../pages/teacher/Materials';
import TeacherAssignments from '../pages/teacher/Assignments';
import TeacherGrading from '../pages/teacher/Grading';
import TeacherAnalytics from '../pages/teacher/Analytics';
import TeacherAttendance from '../pages/teacher/Attendance';
import UploadMaterialPage from '../pages/teacher/UploadMaterialPage';
import GradeSubmissionsPage from '../pages/teacher/GradeSubmissionsPage';
import CreateAssignmentPage from '../pages/teacher/CreateAssignmentPage';
import DiscussionManagementPage from '../pages/teacher/DiscussionManagementPage';

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
        <Route path="submissions"  element={<Navigate to="/teacher/assignments" replace />} />
        <Route path="grading"      element={<TeacherGrading />} />
        <Route path="analytics"    element={<TeacherAnalytics />} />
        <Route path="attendance"   element={<TeacherAttendance />} />
        <Route path="discussions"  element={<DiscussionManagementPage />} />
        <Route path="materials/upload" element={<UploadMaterialPage />} />
        <Route path="assignments/create" element={<CreateAssignmentPage />} />
        <Route path="assignments/:id/grade" element={<GradeSubmissionsPage />} />
        {/* Catch-all → default teacher page with absolute path */}
        <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
      </Routes>
    </TeacherMainLayout>
  );
};

export default TeacherRoutes;
