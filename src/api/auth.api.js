import api from "./axios";

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const selectWorkspace = (workspaceId) => 
  api.post("/auth/select-workspace", { workspace_id: workspaceId });
  
export const me = () => api.get("/auth/me");
export const logout = () => api.get("/auth/logout");