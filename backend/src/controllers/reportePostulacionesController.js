const {
  generarReportePostulaciones,
  exportarCsvPostulaciones,
} = require('../services/reportePostulacionesService');
const { getStatusCode } = require('../utils/errors');
const { buildErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

async function getReportePostulaciones(_req, res) {
  try {
    const stats = await generarReportePostulaciones();
    return res.status(200).json(stats);
  } catch (error) {
    logger.error(`[getReportePostulaciones] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al generar reporte de postulaciones', error),
    );
  }
}

async function exportReportePostulacionesCsv(_req, res) {
  try {
    const csv = await exportarCsvPostulaciones();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-postulaciones.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    logger.error(`[exportReportePostulacionesCsv] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al exportar reporte de postulaciones', error),
    );
  }
}

module.exports = {
  getReportePostulaciones,
  exportReportePostulacionesCsv,
};
