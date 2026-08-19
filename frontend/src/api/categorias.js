import { api } from "./client";

/** GET /categorias — público */
export async function fetchCategorias() {
  const { data } = await api.get("/categorias");
  return data;
}

/** POST /categorias — Bearer */
export async function createCategoria(body) {
  const { data } = await api.post("/categorias", body);
  return data;
}

/** PUT /categorias/:id — Bearer */
export async function updateCategoria(id, body) {
  const { data } = await api.put(`/categorias/${id}`, body);
  return data;
}

/** DELETE /categorias/:id — Bearer */
export async function deleteCategoria(id) {
  const { data } = await api.delete(`/categorias/${id}`);
  return data;
}
