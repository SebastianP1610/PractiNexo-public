import { api } from "./client";

/**
 * POST /auth/login — no requiere Bearer (el interceptor solo añade token si existe).
 */
export async function login(correo, password) {
  const { data } = await api.post("/auth/login", { correo, password });
  return data;
}

/**
 * GET /auth/validar-token — requiere Authorization: Bearer <jwt>
 */
export async function validarToken() {
  const { data } = await api.get("/auth/validar-token");
  return data;
}
