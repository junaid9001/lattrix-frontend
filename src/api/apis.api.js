import api from "./axios";

export const getApisByGroup = (groupId) => api.get(`/api-groups/${groupId}/apis`);
export const createApi = (groupId, data) => api.post(`/api-groups/${groupId}/apis`, data);
export const updateApi = (groupId, apiId, data) => api.put(`/api-groups/${groupId}/apis/${apiId}`, data);
export const deleteApi = (groupId, apiId) => api.delete(`/api-groups/${groupId}/apis/${apiId}`);