import apiClient from "./client";

export const collegesApi = {
  // ✅ ADDED: Fetch all colleges (Fixes the "collegesApi.getAll is not a function" error)
  getAll: async (params = {}) => {
    const response = await apiClient.get("/api/colleges", { params });
    return response.data;
  },

  // --- Profile ---
  getProfile: async () => {
    const response = await apiClient.get("/api/colleges/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.patch("/api/colleges/profile", data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/colleges/${id}`);
    return response.data;
  },

  // --- Students Management ---
  getAllStudents: async (collegeId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(
      `/api/colleges/${collegeId}/students?${params}`,
    );
    return response.data;
  },

  getStudentById: async (studentId) => {
    const response = await apiClient.get(`/api/colleges/students/${studentId}`);
    return response.data;
  },

  verifyStudent: async (studentId, data) => {
    const response = await apiClient.post(
      `/api/colleges/verify-student/${studentId}`,
      data,
    );
    return response.data;
  },

  // --- Dashboard & Analytics ---
  getDashboardStats: async () => {
    const response = await apiClient.get("/api/colleges/stats");
    return response.data;
  },

  // --- Verifications ---
  // Fetches BOTH projects and achievements filtered for your college
  getPendingVerifications: async () => {
    const response = await apiClient.get("/api/colleges/verifications/pending");
    return response.data;
  },

  verifyAchievement: async (id, data) => {
    const response = await apiClient.patch(
      `/api/achievements/${id}/verify`,
      data,
    );
    return response.data;
  },

  verifyProject: async (id, data) => {
    const response = await apiClient.patch(`/api/projects/${id}/verify`, data);
    return response.data;
  },
};

export default collegesApi;