const express = require('express');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const {
  uploadFoto,
  uploadCV,
  handleMulterError,
} = require('../middlewares/uploadMiddleware');
const {
  getMiPerfil,
  updateMiPerfil,
  getMisSugerencias,
  uploadFotoPerfil,
  deleteFotoPerfil,
  uploadHojaVida,
  deleteHojaVida,
  downloadHojaVida,
  changePassword,
} = require('../controllers/estudianteController');

const router = express.Router();

router.get('/me', authMiddleware, requireRole('ESTUDIANTE'), getMiPerfil);
router.put('/me', authMiddleware, requireRole('ESTUDIANTE'), updateMiPerfil);
router.get('/me/sugerencias', authMiddleware, requireRole('ESTUDIANTE'), getMisSugerencias);

router.post(
  '/me/foto',
  authMiddleware,
  requireRole('ESTUDIANTE'),
  uploadFoto.single('foto'),
  handleMulterError,
  uploadFotoPerfil,
);
router.delete('/me/foto', authMiddleware, requireRole('ESTUDIANTE'), deleteFotoPerfil);

router.post(
  '/me/cv',
  authMiddleware,
  requireRole('ESTUDIANTE'),
  uploadCV.single('cv'),
  handleMulterError,
  uploadHojaVida,
);
router.get('/me/cv', authMiddleware, requireRole('ESTUDIANTE'), downloadHojaVida);
router.delete('/me/cv', authMiddleware, requireRole('ESTUDIANTE'), deleteHojaVida);

router.put('/me/password', authMiddleware, requireRole('ESTUDIANTE'), changePassword);

module.exports = router;
