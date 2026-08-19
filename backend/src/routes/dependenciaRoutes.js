const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  getDependencias,
  crearDependencia,
  actualizarDependencia,
  eliminarDependencia,
} = require('../controllers/dependenciaController');

const router = express.Router();

router.get('/', getDependencias);
router.post('/', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), crearDependencia);
router.put('/:id', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), actualizarDependencia);
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), eliminarDependencia);

module.exports = router;
