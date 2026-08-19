import { api } from "./client";

/** GET /ofertas — público (query opcional según backend) */
export async function fetchOfertas(params = {}) {
  const { data } = await api.get("/ofertas", { params });
  return data;
}

/** GET /ofertas/:id — público */
export async function fetchOfertaById(id) {
  const { data } = await api.get(`/ofertas/${id}`);
  return data;
}

/**
 * POST /ofertas — Bearer obligatorio (interceptor en client.js).
 */
export async function createOferta(payload) {
  const { data } = await api.post("/ofertas", payload);
  return data;
}

/** PUT /ofertas/:id — Bearer. Body JSON parcial o completo. */
export async function updateOferta(id, payload) {
  const { data } = await api.put(`/ofertas/${id}`, payload);
  return data;
}

/** DELETE /ofertas/:id — Bearer. Sin body. */
export async function deleteOferta(id) {
  const { data } = await api.delete(`/ofertas/${id}`);
  return data;
}
