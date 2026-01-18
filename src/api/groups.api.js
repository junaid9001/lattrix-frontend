import api from "./axios";

export const createGroup = (data) => api.post("/api-groups/", data);
export const getGroups = () => {

    return api.get("/api-groups"); 
};
export const getGroupById = (id) => api.get(`/api-groups/${id}`);
export const deleteGroup = (id) => api.delete("/api-groups", { data: { api_group_id: id } });