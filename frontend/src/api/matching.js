import { api } from "./client";

export async function fetchSugerencias(perfil) {
  const { data } = await api.post("/matching/sugerencias", perfil);
  return data;
}