import { api } from "./client";

/** GET /admin/estudiantes — Bearer ADMIN */
export async function fetchEstudiantesAdmin(params = {}) {
  const { data } = await api.get("/admin/estudiantes", { params });
  return data;
}

/** GET /admin/estudiantes/:id — Bearer ADMIN */
export async function fetchEstudianteAdminById(id) {
  const { data } = await api.get(`/admin/estudiantes/${id}`);
  return data;
}

/** POST /admin/estudiantes — Bearer ADMIN */
export async function createEstudianteAdmin(body) {
  const { data } = await api.post("/admin/estudiantes", body);
  return data;
}

/** PUT /admin/estudiantes/:id — Bearer ADMIN */
export async function updateEstudianteAdmin(id, body) {
  const { data } = await api.put(`/admin/estudiantes/${id}`, body);
  return data;
}

/** DELETE /admin/estudiantes/:id — Bearer ADMIN */
export async function deleteEstudianteAdmin(id) {
  const { data } = await api.delete(`/admin/estudiantes/${id}`);
  return data;
}
