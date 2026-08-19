import { api } from "./client";

/** GET /dependencias — público */
export async function fetchDependencias() {
  const { data } = await api.get("/dependencias");
  return data;
}

/** POST /dependencias — Bearer */
export async function createDependencia(body) {
  const { data } = await api.post("/dependencias", body);
  return data;
}

/** PUT /dependencias/:id — Bearer */
export async function updateDependencia(id, body) {
  const { data } = await api.put(`/dependencias/${id}`, body);
  return data;
}

/** DELETE /dependencias/:id — Bearer */
export async function deleteDependencia(id) {
  const { data } = await api.delete(`/dependencias/${id}`);
  return data;
}
