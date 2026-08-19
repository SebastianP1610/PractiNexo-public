/**
 * Extrae texto útil de errores Axios según contrato del backend (mensaje / error).
 */
export function getApiErrorMessage(err, fallback = "Ocurrió un error.") {
  const d = err?.response?.data;
  if (!d || typeof d !== "object") return fallback;
  const detail = typeof d.error === "string" ? d.error.trim() : "";
  const msg = typeof d.mensaje === "string" ? d.mensaje.trim() : "";
  if (detail) return detail;
  if (msg) return msg;
  return fallback;
}
