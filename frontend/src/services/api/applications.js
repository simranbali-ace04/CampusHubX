import apiClient from "./client";

export const applicationsApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/api/applications?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/applications/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post("/api/applications", data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/api/applications/${id}/status`, {
      status,
    });
    return response.data;
  },

  getByOpportunity: async (opportunityId) => {
    const response = await apiClient.get(
      `/api/applications/opportunity/${opportunityId}`,
    );
    return response.data;
  },

  getByStudent: async (studentId) => {
    const response = await apiClient.get(
      `/api/applications/student/${studentId}`,
    );
    return response.data;
  },
};
