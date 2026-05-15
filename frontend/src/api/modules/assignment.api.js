import api from "../axios.config";

const assignmentApi = {
  // Teacher methods
  createAssignment: (data) => api.post("assignments/create", data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  getAssignmentSubmissions: (id) => api.get(`assignments/${id}/submissions`),
  
  getTeacherSubmissions: () => api.get("teacher/submissions"),

  gradeSubmission: (submissionId, data) => api.post(`submissions/${submissionId}/grade`, data),

  // Shared/Student methods
  getAssignments: (courseId) => api.get(`assignments?course_id=${courseId}`),
  
  getAssignmentDetails: (id) => api.get(`assignments/${id}`),
  
  submitAssignment: (assignmentId, data) => api.post(`assignments/${assignmentId}/submit`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  getMySubmissions: () => api.get("student/submissions"),

  getStudentAssignments: (courseId = '') => api.get(`assignments?course_id=${courseId}`)
};

export default assignmentApi;
