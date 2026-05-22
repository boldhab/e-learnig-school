import api from '../axios.config';

export const parentApi = {
    getChildren: () => api.get('/parent/children'),
    getChildOverview: (id) => api.get(`/parent/students/${id}/overview`),
    getChildCourses: (id) => api.get(`/parent/students/${id}/courses`),
    getChildAssignments: (id) => api.get(`/parent/students/${id}/assignments`),
    getChildAttendance: (id) => api.get(`/parent/students/${id}/attendance`),
    getChildPerformance: (id) => api.get(`/parent/students/${id}/performance`),
    getChildRiskReport: (id) => api.get(`/parent/students/${id}/risk-report`),
    getChildReports: (id) => api.get(`/parent/students/${id}/reports`),
    getNotifications: () => api.get('/parent/notifications'),
};
