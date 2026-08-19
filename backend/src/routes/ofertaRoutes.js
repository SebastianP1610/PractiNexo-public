const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  getOfertas,
  getOfertaById,
  crearOferta,
  actualizarOferta,
  eliminarOferta,
} = require('../controllers/ofertaController');

const router = express.Router();

const adminOnly = [authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN')];

router.get('/', getOfertas);
router.get('/:id', getOfertaById);
router.post('/', adminOnly, crearOferta);
router.put('/:id', adminOnly, actualizarOferta);
router.delete('/:id', adminOnly, eliminarOferta);

module.exports = router;
