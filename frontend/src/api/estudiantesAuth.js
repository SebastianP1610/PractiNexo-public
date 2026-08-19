import { api } from "./client";

/**
 * POST /estudiantes-auth/register — público (sin Bearer).
 * @param {object} body — nombre, correo, password obligatorios; resto opcional.
 */
export async function registerEstudiante(body) {
  const { data } = await api.post("/estudiantes-auth/register", body);
  return data;
}

/**
 * POST /estudiantes-auth/login — público. Respuesta 200: { token, estudiante }.
 */
export async function loginEstudiante(correo, password) {
  const { data } = await api.post("/estudiantes-auth/login", {
    correo: typeof correo === "string" ? correo.trim().toLowerCase() : correo,
    password,
  });
  return data;
}

/**
 * POST /estudiantes-auth/forgot-password — público. Cuerpo: { correo }.
 */
export async function forgotPasswordEstudiante(correo) {
  const { data } = await api.post("/estudiantes-auth/forgot-password", {
    correo: typeof correo === "string" ? correo.trim().toLowerCase() : correo,
  });
  return data;
}

/**
 * POST /estudiantes-auth/reset-password — público. Cuerpo: { token, newPassword }.
 */
export async function resetPasswordEstudiante(token, newPassword) {
  const { data } = await api.post("/estudiantes-auth/reset-password", {
    token: typeof token === "string" ? token.trim() : token,
    newPassword,
  });
  return data;
}
