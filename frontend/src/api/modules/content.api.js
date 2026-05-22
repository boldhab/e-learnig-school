import api from "../axios.config";

const contentApi = {
  getCourses: () => api.get("courses"),

  getCategories: (type) => api.get(`categories?type=${type}`),

  getMaterials: (subjectId, classId) =>
    api.get("materials", {
      params: {
        subject_id: subjectId,
        ...(classId ? { class_id: classId } : {}),
      },
    }),

  /**
   * Get students enrolled in a course.
   * @param {number} courseId - The course ID
   * @param {number|null} classId - Optional class ID to scope to a specific section
   */
  getCourseStudents: (courseId, classId = null) => {
    const url = classId
      ? `courses/${courseId}/students?class_id=${classId}`
      : `courses/${courseId}/students`;
    return api.get(url);
  },

  getCourseSubmissionStats: (courseId) => api.get(`courses/${courseId}/submission-stats`),

  uploadMaterial: (data) =>
    api.post("materials/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteMaterial: (id) => api.delete(`materials/${id}`),
};

export default contentApi;
