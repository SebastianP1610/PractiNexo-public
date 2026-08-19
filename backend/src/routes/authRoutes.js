const express = require('express');
const { loginAdmin, validarToken } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/validar-token', authMiddleware, validarToken);

module.exports = router;
