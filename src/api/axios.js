import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;


    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        await api.get("/auth/refresh");
        
        return api(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    const message =
      err.response?.data?.message ||
      err.response?.data ||
      "Request failed";
    return Promise.reject(new Error(message));
  }
);

export default api;