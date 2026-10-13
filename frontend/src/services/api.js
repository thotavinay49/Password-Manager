// src/services/api.js
import axios from "axios";

export const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  const storedUrl = typeof window !== "undefined" ? localStorage.getItem("backend_url") : null;
  if (storedUrl && storedUrl.trim()) return storedUrl.trim().replace(/\/+$/, "");
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8080";
    }
  }
  return "https://password-manager-backend.onrender.com";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Restore token if present
if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem("token");
  if (savedToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
  }
}

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
  const dynamicBase = getBaseURL();
  if (dynamicBase && !config.url?.startsWith("http")) {
    config.baseURL = dynamicBase;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Detect if Vercel SPA rewrite returned index.html for an API endpoint
    if (
      typeof response.data === "string" &&
      (response.data.trim().startsWith("<!doctype html") ||
        response.data.trim().startsWith("<!DOCTYPE html") ||
        response.data.includes("<div id=\"root\">"))
    ) {
      return Promise.reject({
        response: {
          status: 503,
          data: {
            message:
              "Backend server not connected. The request was intercepted by the static host. Please set VITE_BACKEND_URL in Vercel or configure the backend URL in settings.",
          },
        },
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthenticationRequest = [
      "/api/user/login",
      "/api/user/register",
      "/api/user/refresh",
    ].some((path) => originalRequest?.url?.includes(path));

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
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
        console.warn("🔁 Refresh token failed:", err?.response?.status);
        processQueue(err, null);
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          window.location.href = "/login";
        }
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
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  } else {
    delete api.defaults.headers.common["Authorization"];
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }
}

export function clearAuth() {
  delete api.defaults.headers.common["Authorization"];
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("username");
  }
}

export default api;
