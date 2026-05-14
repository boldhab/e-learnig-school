import api from "../axios.config";

const adminApi = {
  // User Management
  getUsers: () => api.get("admin/users"),
  updateUser: (data) => api.post("admin/users/update", data),
  deleteUser: (id) => api.post("admin/users/delete", { id }),
  resetPassword: (id, password) => api.post("admin/users/reset-password", { id, password }),
  createStudent: (data) => api.post("admin/students", data),
  createTeacher: (data) => api.post("admin/teachers", data),
  updateUserStatus: (id, status) => api.post("admin/users/status", { id, status }),
  
  // Assignments/Classes
  assignStudent: (data) => api.post("admin/assign-student", data),
  assignTeacher: (data) => api.post("admin/assign-teacher", data),
  getTeacherAssignments: (id) => api.get(`admin/teachers/${id}/assignments`),

  // Stats & Overview
  getDashboardStats: () => api.get("admin/stats"),
  getActivityLogs: () => api.get("admin/logs"),
  getDetailedActivityLogs: (limit = 100) => api.get("admin/logs/detailed", { params: { limit } }),
  getAssignmentsOverview: () => api.get("admin/assignments/overview"),
  getDiscussionsMonitoring: () => api.get("admin/discussions/monitoring"),
  // Discussion actions
  deleteThread: (threadId) => api.delete(`discussions/topics/${threadId}`),
  getAttendanceReports: () => api.get("admin/attendance/reports"),
  getPerformanceAnalytics: () => api.get("admin/performance/analytics"),

  // Academic Management
  getAcademicDepartments: () => api.get("admin/academic/departments"),
  createDepartment: (data) => api.post("admin/academic/departments", data),
  assignTeacherToDepartment: (departmentId, data) => api.post(`admin/academic/departments/${departmentId}/teachers`, data),
  createDepartmentClass: (departmentId, data) => api.post(`admin/academic/departments/${departmentId}/classes`, data),
  assignCourseToClass: (classId, data) => api.post(`admin/academic/classes/${classId}/courses`, data),
  createStandaloneClass: (data) => api.post("admin/academic/classes", data),
  createCourse: (data) => api.post("admin/academic/courses", data),
  getCourseTeachers: (courseId) => api.get(`admin/academic/courses/${courseId}/teachers`),

  // Class & Course Lists
  getClasses: () => api.get("admin/classes"),
  createClass: (data) => api.post("admin/classes", data),
  updateClass: (id, data) => api.put(`admin/classes/${id}`, data),
  deleteClass: (id) => api.delete(`admin/classes/${id}`),
  removeStudentFromClass: (classId, studentId) => api.post(`admin/classes/${classId}/remove-student`, { student_id: studentId }),
  getAvailableStudentsForClass: (classId) => api.get(`admin/classes/${classId}/available-students`),
  getCourses: () => api.get("admin/courses"),
  deleteCourse: (id) => api.delete(`admin/courses/${id}`),
  getCoursesOverview: () => api.get("admin/courses/overview"),
  getClassDetails: (classId) => api.get(`admin/classes/${classId}`),
  getCourseDetails: (courseId, classId) =>
    api.get(`admin/courses/${courseId}/details`, {
      params: classId ? { class_id: classId } : {}
    }),

  // System
  backupSystem: () => api.post("admin/backup"),
  getSettings: () => api.get("admin/settings"),
  updateSettings: (data) => api.post("admin/settings", data)
};

export default adminApi;
