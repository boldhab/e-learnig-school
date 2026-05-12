import api from '../axios.config';

const teacherApi = {
  getDashboard: () => api.get('teacher/dashboard'),
};

export default teacherApi;