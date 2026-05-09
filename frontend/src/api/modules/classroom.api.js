import api from '../axios.config';

const classroomApi = {
  getCourses: () => api.get('/courses'),
  getCourseDetails: (id) => api.get(`/courses/${id}`),
  getCourseMaterials: (id) => api.get(`/courses/${id}/materials`),
  getCourseStudents: (id) => api.get(`/courses/${id}/students`),
};

export default classroomApi;
