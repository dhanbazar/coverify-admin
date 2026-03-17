import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("coverify_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("coverify_admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
