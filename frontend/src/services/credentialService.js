// src/services/credentialService.js
import api from "./api";

export const fetchAll  = () =>
  api.get("/api/credentials/me").then((r) => r.data);

export const addOne    = (dto) =>
  api.post("/api/credentials/add", dto).then((r) => r.data);

export const updateOne = (id, dto) =>
  api.put("/api/credentials/change", { id, ...dto }).then((r) => r.data);

export const deleteOne = (id) =>
  api.delete(`/api/credentials/delete/${id}`);
