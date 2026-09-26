import { api } from "./client";

/** GET /programas — público */
export async function fetchProgramas() {
  const { data } = await api.get("/programas");
  return data;
}

/** POST /programas — Bearer */
export async function createPrograma(body) {
  const { data } = await api.post("/programas", body);
  return data;
}

/** PUT /programas/:id — Bearer */
export async function updatePrograma(id, body) {
  const { data } = await api.put(`/programas/${id}`, body);
  return data;
}

/** DELETE /programas/:id — Bearer */
export async function deletePrograma(id) {
  const { data } = await api.delete(`/programas/${id}`);
  return data;
}
