// src/services/userService.js
import api from "./api";

export async function loginRequest(username, password) {
  const { data } = await api.post("/api/user/login", { username, password });
  return data; 
}

export async function registerRequest(username, password) {
  const { data } = await api.post("/api/user/register", { username, password });
  return data;
}

export const fetchRole = async () => {
  const { data } = await api.get("/api/user/me");
  return data.role;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/api/user/me");
  return data;
};

export const refreshAccessToken = async () => {
  const { data } = await api.post("/api/user/refresh");
  return data;
};

export const logoutRequest = () => api.post("/api/user/logout");

export const changeUsername = (newUsername) =>
  api.patch("/api/user/username", { newUsername });

export const changePassword = (currentPassword, newPassword) =>
  api.patch("/api/user/password", { currentPassword, newPassword });
