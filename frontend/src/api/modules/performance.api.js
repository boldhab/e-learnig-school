import api from "../axios.config";

const performanceApi = {
  getStudentPerformance: (courseId = '') => api.get(`performance/student${courseId ? `?course_id=${courseId}` : ''}`),
  getStudentStats: () => api.get('performance/student/stats'),
  
  getCoursePerformance: (courseId) => api.get(`performance/course/${courseId}`),
  
  getGapAnalysis: (courseId = '') => api.get(`performance/gap-analysis${courseId ? `?course_id=${courseId}` : ''}`),
  
  getRiskReport: () => api.get("performance/risk-report")
};

export default performanceApi;
