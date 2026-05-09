import api from "../axios.config";

const contentApi = {
  getCourses: () => api.get("courses"),
  
  getCategories: (type) => api.get(`categories?type=${type}`),
  
  getMaterials: (subjectId, classId) => api.get(`materials?subject_id=${subjectId}&class_id=${classId}`),
  
  uploadMaterial: (data) => api.post("materials/upload", data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  deleteMaterial: (id) => api.delete(`materials/${id}`)
};

export default contentApi;
