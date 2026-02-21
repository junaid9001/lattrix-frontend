import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        await api.get("/auth/refresh");
        return api(originalRequest);
      } catch (refreshErr) {
        const refreshMsg =
          refreshErr.response?.data?.message ||
          refreshErr.response?.data?.error ||
          "Session expired";
        return Promise.reject(new Error(refreshMsg));
      }
    }

    const data = err.response?.data;
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : "Request failed");

    return Promise.reject(new Error(message));
  }
);

export default api;
