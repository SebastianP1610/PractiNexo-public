const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  getProgramas,
  crearPrograma,
  actualizarPrograma,
  eliminarPrograma,
} = require('../controllers/programaAcademicoController');

const router = express.Router();

router.get('/', getProgramas);
router.post('/', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), crearPrograma);
router.put('/:id', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), actualizarPrograma);
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), eliminarPrograma);

module.exports = router;
