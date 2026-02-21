import api from "./axios";

export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
//new
export const verifyOtp = (data) => api.post("/auth/verify-otp", data);

export const resendOtp = (data) => api.post("/auth/resend-otp", data);

export const selectWorkspace = (workspaceId) => 
  api.post("/auth/select-workspace", { workspace_id: workspaceId });
  
export const me = () => api.get("/auth/me");
export const logout = () => api.get("/auth/logout");

export const createWorkspace = (name) => 
  api.post("/auth/workspace", { name });

export const getWorkspaces = () => 
  api.get("/auth/workspaces");