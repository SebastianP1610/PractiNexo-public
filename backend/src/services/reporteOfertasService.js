const Oferta = require('../models/oferta');
const {
  calcularEstadisticasOfertas,
  generarCsvOfertas,
} = require('./reporteOfertasEngine');

async function obtenerDatosReporteOfertas() {
  const ofertas = await Oferta.find()
    .populate('dependenciaId', 'nombre')
    .lean();

  return ofertas.map((o) => ({
    titulo: o.titulo,
    estadoVigencia: o.estadoVigencia,
    tipoOportunidad: o.tipoOportunidad,
    dependenciaNombre: o.dependenciaId?.nombre || '',
  }));
}

async function generarReporteOfertas() {
  const datos = await obtenerDatosReporteOfertas();
  return calcularEstadisticasOfertas(datos);
}

async function exportarCsvOfertas() {
  const datos = await obtenerDatosReporteOfertas();
  return generarCsvOfertas(datos);
}

module.exports = {
  generarReporteOfertas,
  exportarCsvOfertas,
  obtenerDatosReporteOfertas,
};
