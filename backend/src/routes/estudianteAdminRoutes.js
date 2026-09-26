const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  getEstudiantes,
  getEstudiantePorId,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
} = require('../controllers/estudianteAdminController');

const router = express.Router();

router.use(authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'));

router.get('/', getEstudiantes);
router.get('/:id', getEstudiantePorId);
router.post('/', crearEstudiante);
router.put('/:id', actualizarEstudiante);
router.delete('/:id', eliminarEstudiante);

module.exports = router;
