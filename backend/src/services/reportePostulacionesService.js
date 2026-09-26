const Postulacion = require('../models/postulacion');
const {
  calcularEstadisticasPostulaciones,
  generarCsvPostulaciones,
} = require('./reportePostulacionesEngine');

async function obtenerDatosReportePostulaciones() {
  const postulaciones = await Postulacion.find()
    .populate('estudianteId', 'nombre')
    .populate('ofertaId', 'titulo')
    .lean();

  return postulaciones.map((p) => ({
    estado: p.estado,
    estudianteNombre: p.estudianteId?.nombre || '',
    ofertaTitulo: p.ofertaId?.titulo || '',
  }));
}

async function generarReportePostulaciones() {
  const datos = await obtenerDatosReportePostulaciones();
  return calcularEstadisticasPostulaciones(datos);
}

async function exportarCsvPostulaciones() {
  const datos = await obtenerDatosReportePostulaciones();
  return generarCsvPostulaciones(datos);
}

module.exports = {
  generarReportePostulaciones,
  exportarCsvPostulaciones,
  obtenerDatosReportePostulaciones,
};
