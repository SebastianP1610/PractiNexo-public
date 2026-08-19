const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = require('../controllers/categoriaController');

const router = express.Router();

router.get('/', getCategorias);
router.post('/', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), crearCategoria);
router.put('/:id', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), actualizarCategoria);
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), eliminarCategoria);

module.exports = router;
