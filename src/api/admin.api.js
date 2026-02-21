import api from "./axios";

// 1. Financial & Overview Stats
export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// 2. Live Stripe Activity Feed
export const getAdminActivities = async () => {
  const response = await api.get("/admin/activities");
  return response.data;
};

// 3. System Health (Kafka & DB Telemetry)
export const getSystemHealth = async () => {
  const response = await api.get("/admin/health");
  return response.data;
};

// 4. User Management
export const getUsers = async (page = 1, limit = 10) => {
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

// 5. Ban Action
export const toggleBanUser = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/ban`);
  return response.data;
};