import apiClient from "./client";

export const collegesApi = {
  getAll: async () => {
    const response = await apiClient.get("/api/colleges");
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/colleges/${id}`);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put("/api/colleges/profile", data);
    return response.data;
  },

  getStudents: async (id, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(
      `/api/colleges/${id}/students?${params}`,
    );
    return response.data;
  },

  // 👉 2. Add this NEW function
  getDashboardStats: async () => {
    const response = await apiClient.get("/api/colleges/stats");
    return response.data;
  },

  getPendingVerifications: async () => {
    const response = await apiClient.get("/api/colleges/verifications/pending");
    return response.data;
  },
};

export default collegesApi;
