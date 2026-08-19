function formatearFecha(iso, options = {}) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const opts = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };
  if (options.withTime) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
  }
  return d.toLocaleString("es-CO", opts);
}

function formatearFechaLarga(iso) {
  return formatearFecha(iso, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearFechaCorta(iso) {
  return formatearFecha(iso, {});
}

function mismoDia(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function textoPublicacion(iso) {
  if (!iso) return "Reciente";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Reciente";
  const now = new Date();
  if (mismoDia(d, now)) return "Publicado hoy";
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 1) return "Publicado ayer";
  if (diff > 0 && diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

function truncar(texto, max = 160, sufijo = "…") {
  const t = String(texto || "");
  if (t.length <= max) return t;
  return `${t.slice(0, max)}${sufijo}`;
}

function diasHastaCierre(iso) {
  if (!iso) return null;
  const c = new Date(iso);
  if (Number.isNaN(c.getTime())) return null;
  return Math.ceil((c - Date.now()) / 86400000);
}

function esUrgente(iso, diasLimite = 14) {
  const d = diasHastaCierre(iso);
  return d !== null && d >= 0 && d <= diasLimite;
}

export {
  formatearFecha,
  formatearFechaLarga,
  formatearFechaCorta,
  textoPublicacion,
  truncar,
  diasHastaCierre,
  esUrgente,
};
