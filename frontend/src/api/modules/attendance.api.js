import api from "../axios.config";

const attendanceApi = {
  bulkMark: (data) => api.post("attendance/bulk", data),
  
  getCourseAttendance: (courseId, date) => api.get(`attendance/course?course_id=${courseId}&date=${date}`),
  
  getStudentAttendance: (studentId = '') => api.get(`attendance/student${studentId ? `?student_id=${studentId}` : ''}`),
};

export default attendanceApi;
