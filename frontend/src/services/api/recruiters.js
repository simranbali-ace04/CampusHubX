import apiClient from "./client";

export const recruitersApi = {
  getAll: async () => {
    const response = await apiClient.get("/api/recruiters");
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/recruiters/${id}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/api/recruiters/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put("/api/recruiters/profile", data);
    return response.data;
  },
  getDashboard: async () => {
    const response = await apiClient.get("/api/recruiters/dashboard");
    return response.data;
  },

  getMyOpportunities: async () => {
    const response = await apiClient.get("/api/recruiters/opportunities");
    return response.data;
  },

  getAnalytics: async () => {
    const response = await apiClient.get("/api/recruiters/analytics");
    return response.data;
  },
};
