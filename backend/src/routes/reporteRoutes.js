const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  getReporteOfertas,
  exportReporteOfertasCsv,
} = require('../controllers/reporteOfertasController');
const {
  getReportePostulaciones,
  exportReportePostulacionesCsv,
} = require('../controllers/reportePostulacionesController');

const router = express.Router();
const admin = [authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN')];

router.get('/ofertas', ...admin, getReporteOfertas);
router.get('/ofertas/csv', ...admin, exportReporteOfertasCsv);
router.get('/postulaciones', ...admin, getReportePostulaciones);
router.get('/postulaciones/csv', ...admin, exportReportePostulacionesCsv);

module.exports = router;
