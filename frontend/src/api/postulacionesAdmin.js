import { api } from "./client";

export async function fetchPostulacionesAdmin(params = {}) {
  const { data } = await api.get("/postulaciones", { params });
  return data;
}

export async function fetchPostulacionAdmin(id) {
  const { data } = await api.get(`/postulaciones/${id}`);
  return data;
}

export async function cambiarEstadoPostulacionAdmin(id, estado, observacion = "") {
  const { data } = await api.patch(`/postulaciones/${id}/estado`, {
    estado,
    observacion,
  });
  return data;
}

/** GET /postulaciones/:id/hoja-vida — descarga autenticada para administradores. */
export async function downloadHojaVidaPostulacion(id) {
  const { data } = await api.get(`/postulaciones/${id}/hoja-vida`, { responseType: "blob" });
  return data;
}
