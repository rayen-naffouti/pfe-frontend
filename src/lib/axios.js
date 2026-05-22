import axios from "axios";
import { clearAuthSession, getAuthRole } from "./auth"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || "http://localhost:8080/api",
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 – redirect to login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = ["/auth/login", "/auth/register", "/customers/register"].some((path) =>
      error.config?.url?.includes(path),
    );

    if (error.response?.status === 401 && !isAuthRequest && localStorage.getItem("token")) {
      clearAuthSession();
      window.location.href = "/login";
    }

    if (error.response?.status === 403 && !isAuthRequest && error.response?.data?.message === "Invalid token") {
      clearAuthSession();
      window.location.href = "/login";
    } else if (error.response?.status === 403 && error.response?.data?.message === "Admin access is required") {
      localStorage.setItem("authRole", "user");
      window.location.href = "/portal";
    } else if (error.response?.status === 403 && !isAuthRequest && getAuthRole() !== "admin") {
      window.location.href = "/portal";
    }

    return Promise.reject(error);
  }
);

export default api;
