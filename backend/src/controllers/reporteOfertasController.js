const {
  generarReporteOfertas,
  exportarCsvOfertas,
} = require('../services/reporteOfertasService');
const { getStatusCode } = require('../utils/errors');
const { buildErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

async function getReporteOfertas(_req, res) {
  try {
    const stats = await generarReporteOfertas();
    return res.status(200).json(stats);
  } catch (error) {
    logger.error(`[getReporteOfertas] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al generar reporte de ofertas', error),
    );
  }
}

async function exportReporteOfertasCsv(_req, res) {
  try {
    const csv = await exportarCsvOfertas();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ofertas.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    logger.error(`[exportReporteOfertasCsv] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al exportar reporte de ofertas', error),
    );
  }
}

module.exports = {
  getReporteOfertas,
  exportReporteOfertasCsv,
};
