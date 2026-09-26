import { api } from "./client";

/** GET /reportes/ofertas — Bearer ADMIN */
export async function fetchReporteOfertas() {
  const { data } = await api.get("/reportes/ofertas");
  return data;
}

/** GET /reportes/ofertas/csv — Bearer ADMIN */
export async function fetchReporteOfertasCsv() {
  const response = await api.get("/reportes/ofertas/csv", { responseType: "blob" });
  return response.data;
}

/** GET /reportes/postulaciones — Bearer ADMIN */
export async function fetchReportePostulaciones() {
  const { data } = await api.get("/reportes/postulaciones");
  return data;
}

/** GET /reportes/postulaciones/csv — Bearer ADMIN */
export async function fetchReportePostulacionesCsv() {
  const response = await api.get("/reportes/postulaciones/csv", { responseType: "blob" });
  return response.data;
}
