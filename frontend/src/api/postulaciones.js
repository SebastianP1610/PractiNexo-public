import { api } from "./client";

/**
 * POST /postulaciones — Bearer estudiante. Body: { ofertaId, observacion? }.
 */
export async function createPostulacion(body) {
  const { data } = await api.post("/postulaciones", body);
  return data;
}

/**
 * GET /postulaciones/mis — Bearer estudiante. Respuesta: { mensaje, data: Postulacion[] }.
 */
export async function fetchMisPostulaciones() {
  const { data } = await api.get("/postulaciones/mis");
  return data;
}

/**
 * DELETE /postulaciones/:id — Bearer estudiante. Solo permite cancelar
 * postulaciones en estado PENDIENTE o EN_REVISION.
 */
export async function deletePostulacion(id) {
  const { data } = await api.delete(`/postulaciones/${id}`);
  return data;
}

/** Normaliza `data` como array de postulaciones. */
export function extractPostulacionesList(res) {
  if (!res || typeof res !== "object") return [];
  const d = res.data;
  return Array.isArray(d) ? d : [];
}

export function extractPostulacionCreada(res) {
  if (!res || typeof res !== "object") return null;
  const d = res.data;
  return d && typeof d === "object" ? d : null;
}
