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
  getAttendanceReports: () => api.get("admin/attendance/reports"),
  getPerformanceAnalytics: () => api.get("admin/performance/analytics"),

  // Class & Course Lists
  getClasses: () => api.get("admin/classes"),
  getCourses: () => api.get("admin/courses"),
  getCoursesOverview: () => api.get("admin/courses/overview"),
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
