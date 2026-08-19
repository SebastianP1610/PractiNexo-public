import { api } from "./client";

/**
 * Rutas de perfil del estudiante autenticado (JWT de login estudiante).
 * No son el panel de administración; el admin usa otros endpoints.
 */

/**
 * GET /estudiantes/me — Bearer JWT estudiante. Respuesta: { mensaje, data }.
 */
export async function fetchEstudianteMe() {
  const { data } = await api.get("/estudiantes/me");
  return data;
}

/**
 * PUT /estudiantes/me — actualización parcial. Cuerpo solo con campos a tocar.
 */
export async function updateEstudianteMe(body) {
  const { data } = await api.put("/estudiantes/me", body);
  return data;
}

/**
 * GET /estudiantes/me/sugerencias — ofertas sugeridas según perfil guardado (Bearer estudiante).
 * Respuesta: { mensaje, data: { oferta, puntajeCoincidencia, criteriosCoincidentes }[] }.
 */
export async function fetchEstudianteMeSugerencias() {
  const { data } = await api.get("/estudiantes/me/sugerencias");
  return data;
}

/** Lista en `data` del JSON de sugerencias /me. */
export function extractMeSugerenciasList(res) {
  if (!res || typeof res !== "object") return [];
  const d = res.data;
  return Array.isArray(d) ? d : [];
}

/**
 * POST /estudiantes/me/foto — subir foto de perfil (multipart/form-data).
 */
export async function uploadFotoPerfil(file) {
  const form = new FormData();
  form.append("foto", file);
  const { data } = await api.post("/estudiantes/me/foto", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * DELETE /estudiantes/me/foto — eliminar foto de perfil.
 */
export async function deleteFotoPerfil() {
  const { data } = await api.delete("/estudiantes/me/foto");
  return data;
}

/**
 * POST /estudiantes/me/cv — subir hoja de vida (PDF, multipart/form-data).
 */
export async function uploadHojaVida(file) {
  const form = new FormData();
  form.append("cv", file);
  const { data } = await api.post("/estudiantes/me/cv", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * DELETE /estudiantes/me/cv — eliminar hoja de vida.
 */
export async function deleteHojaVida() {
  const { data } = await api.delete("/estudiantes/me/cv");
  return data;
}

/** GET /estudiantes/me/cv — descarga autenticada de la hoja de vida propia. */
export async function downloadMiHojaVida() {
  const { data } = await api.get("/estudiantes/me/cv", { responseType: "blob" });
  return data;
}

/**
 * PUT /estudiantes/me/password — cambiar contraseña.
 */
export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.put("/estudiantes/me/password", {
    currentPassword,
    newPassword,
  });
  return data;
}
