const SIN_DATOS = 'Sin datos';

function normalizarValor(valor, fallback = SIN_DATOS) {
  const v = String(valor ?? '').trim();
  return v || fallback;
}

function escaparPuntoYComa(texto) {
  return String(texto ?? '').replace(/;/g, '\\;');
}

module.exports = {
  SIN_DATOS,
  normalizarValor,
  escaparPuntoYComa,
};
