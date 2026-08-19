const express = require('express');
const {
  registerEstudiante,
  loginEstudianteController,
  forgotPasswordEstudiante,
  resetPasswordEstudiante,
} = require('../controllers/estudianteAuthController');

const router = express.Router();

router.post('/register', registerEstudiante);
router.post('/login', loginEstudianteController);
router.post('/forgot-password', forgotPasswordEstudiante);
router.post('/reset-password', resetPasswordEstudiante);

module.exports = router;