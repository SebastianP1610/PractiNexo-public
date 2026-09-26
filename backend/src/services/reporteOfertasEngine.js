const { normalizarValor, escaparPuntoYComa } = require('../utils/reporteHelpers');

const SIN_DEPENDENCIA = 'Sin dependencia';

function calcularEstadisticasOfertas(ofertas) {
  const lista = Array.isArray(ofertas) ? ofertas : [];
  const porEstado = {};
  const porTipo = {};
  const porDependencia = {};

  for (const o of lista) {
    const estado = normalizarValor(o?.estadoVigencia);
    const tipo = normalizarValor(o?.tipoOportunidad);
    const dep = normalizarValor(o?.dependenciaNombre, SIN_DEPENDENCIA);

    porEstado[estado] = (porEstado[estado] || 0) + 1;
    porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    porDependencia[dep] = (porDependencia[dep] || 0) + 1;
  }

  const dependenciasOrdenadas = Object.entries(porDependencia)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, 'es'));

  return {
    total: lista.length,
    porEstado,
    porTipo,
    porDependencia,
    dependenciasOrdenadas,
  };
}

function generarCsvOfertas(ofertas) {
  const lista = Array.isArray(ofertas) ? ofertas : [];
  const encabezado = 'Titulo;Estado;Tipo;Dependencia';
  const filas = lista.map((o) =>
    [
      escaparPuntoYComa(o?.titulo),
      escaparPuntoYComa(normalizarValor(o?.estadoVigencia)),
      escaparPuntoYComa(normalizarValor(o?.tipoOportunidad)),
      escaparPuntoYComa(normalizarValor(o?.dependenciaNombre, SIN_DEPENDENCIA)),
    ].join(';'),
  );
  return [encabezado, ...filas].join('\n');
}

module.exports = {
  calcularEstadisticasOfertas,
  generarCsvOfertas,
  SIN_DEPENDENCIA,
};
