const { normalizarValor, escaparPuntoYComa } = require('../utils/reporteHelpers');

const SIN_ESTUDIANTE = 'Sin estudiante';
const SIN_OFERTA = 'Sin oferta';

function calcularEstadisticasPostulaciones(postulaciones) {
  const lista = Array.isArray(postulaciones) ? postulaciones : [];
  const porEstado = {};
  const porEstudiante = {};
  const porOferta = {};

  for (const p of lista) {
    const estado = normalizarValor(p?.estado);
    const estudiante = normalizarValor(p?.estudianteNombre, SIN_ESTUDIANTE);
    const oferta = normalizarValor(p?.ofertaTitulo, SIN_OFERTA);

    porEstado[estado] = (porEstado[estado] || 0) + 1;
    porEstudiante[estudiante] = (porEstudiante[estudiante] || 0) + 1;
    porOferta[oferta] = (porOferta[oferta] || 0) + 1;
  }

  const aceptadas = porEstado['ACEPTADA'] || 0;
  const tasaAceptacion = lista.length > 0
    ? Math.round((aceptadas / lista.length) * 100)
    : 0;

  const estudiantesOrdenados = Object.entries(porEstudiante)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, 'es'));

  const ofertasOrdenadas = Object.entries(porOferta)
    .map(([titulo, cantidad]) => ({ titulo, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.titulo.localeCompare(b.titulo, 'es'));

  return {
    total: lista.length,
    porEstado,
    porEstudiante,
    porOferta,
    estudiantesOrdenados,
    ofertasOrdenadas,
    tasaAceptacion,
  };
}

function generarCsvPostulaciones(postulaciones) {
  const lista = Array.isArray(postulaciones) ? postulaciones : [];
  const encabezado = 'Estudiante;Oferta;Estado';
  const filas = lista.map((p) =>
    [
      escaparPuntoYComa(normalizarValor(p?.estudianteNombre, SIN_ESTUDIANTE)),
      escaparPuntoYComa(normalizarValor(p?.ofertaTitulo, SIN_OFERTA)),
      escaparPuntoYComa(normalizarValor(p?.estado)),
    ].join(';'),
  );
  return [encabezado, ...filas].join('\n');
}

module.exports = {
  calcularEstadisticasPostulaciones,
  generarCsvPostulaciones,
  SIN_ESTUDIANTE,
  SIN_OFERTA,
};
