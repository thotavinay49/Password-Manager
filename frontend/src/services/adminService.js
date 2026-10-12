// src/services/adminService.js
import api from "./api";

export const getAllUsers = () =>
  api.get("/api/admin/users");

export const addUser = (username, password) =>
  api.post("/api/admin/add-user", { username, password });

export const deleteUserById = (id) =>
  api.delete(`/api/admin/delete-user/${id}`);

export const deleteCredentialFromUser = (userId, credId) =>
  api.delete(`/api/admin/delete-credential/${userId}/${credId}`);
