// src/services/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? "",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  // You may keep this if you dynamically want to skip token logic in future
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthenticationRequest = [
      "/api/user/login",
      "/api/user/register",
      "/api/user/refresh",
    ].some((path) => originalRequest?.url?.includes(path));

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthenticationRequest
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      isRefreshing = true;

      try {
        const res = await api.post("/api/user/refresh");
        const { token } = res.data;

        setAuth(token);
        processQueue(null, token);

        originalRequest.headers["Authorization"] = "Bearer " + token;
        return api(originalRequest);
      } catch (err) {
        console.error("🔁 Refresh token failed:", err?.response?.status, err?.response?.data);
        processQueue(err, null);
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function setAuth(token = null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export function clearAuth() {
  delete api.defaults.headers.common["Authorization"];
}

export default api;
