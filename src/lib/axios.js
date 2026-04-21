import axios from "axios";

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
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
