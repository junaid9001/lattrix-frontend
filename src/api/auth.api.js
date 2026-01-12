import api from "./axios";

export const signup = (data) =>
  api.post("/auth/signup", data);

export const login = (data) =>
  api.post("/auth/login", data);

export const me = () =>
  api.get("/auth/me");

export const logout = () =>
  api.get("/auth/logout");
