const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  postularmeAOferta,
  getMisPostulaciones,
  deleteMiPostulacion,
  listarPostulacionesAdmin,
  detallePostulacionAdmin,
  cambiarEstadoPostulacionAdmin,
  downloadHojaVidaPostulacion,
} = require('../controllers/postulacionController');

const router = express.Router();
const adminOnly = [authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN')];

router.get('/', adminOnly, listarPostulacionesAdmin);
router.get('/:id/hoja-vida', adminOnly, downloadHojaVidaPostulacion);
router.post('/', authMiddleware, requireRole('ESTUDIANTE'), postularmeAOferta);
router.get('/mis', authMiddleware, requireRole('ESTUDIANTE'), getMisPostulaciones);
router.get('/:id', adminOnly, detallePostulacionAdmin);
router.patch('/:id/estado', adminOnly, cambiarEstadoPostulacionAdmin);
router.delete('/:id', authMiddleware, requireRole('ESTUDIANTE'), deleteMiPostulacion);

module.exports = router;
