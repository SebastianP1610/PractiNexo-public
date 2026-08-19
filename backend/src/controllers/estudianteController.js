const path = require('path');
const fs = require('fs');
const {
  obtenerEstudiantePorId,
  actualizarEstudiantePorId,
  cambiarPassword,
} = require('../services/estudianteService');
const { generarSugerenciasParaEstudiante } = require('../services/matchingService');
const { resolveStoredUpload, safeDownloadName } = require('../utils/uploadPath');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

async function getMiPerfil(req, res) {
  try {
    const estudiante = await obtenerEstudiantePorId(req.usuario.sub);

    return res.status(200).json({
      mensaje: 'Perfil del estudiante obtenido correctamente',
      data: estudiante,
    });
  } catch (error) {
    return res.status(404).json({
      mensaje: 'Error al obtener perfil del estudiante',
      error: error.message,
    });
  }
}

async function updateMiPerfil(req, res) {
  try {
    const estudiante = await actualizarEstudiantePorId(req.usuario.sub, req.body);

    return res.status(200).json({
      mensaje: 'Perfil del estudiante actualizado correctamente',
      data: estudiante,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al actualizar perfil del estudiante',
      error: error.message,
    });
  }
}

async function getMisSugerencias(req, res) {
  try {
    const sugerencias = await generarSugerenciasParaEstudiante(req.usuario.sub);

    return res.status(200).json({
      mensaje: 'Sugerencias obtenidas correctamente',
      data: sugerencias,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al obtener sugerencias del estudiante',
      error: error.message,
    });
  }
}

async function uploadFotoPerfil(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se recibió ninguna imagen' });
    }

    const estudianteId = req.usuario.sub;
    const Estudiante = require('../models/estudiante');
    const estudiante = await Estudiante.findById(estudianteId);

    if (!estudiante) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ mensaje: 'El estudiante no existe' });
    }

    if (estudiante.fotoPerfil) {
      const oldPath = path.join(UPLOADS_DIR, estudiante.fotoPerfil);
      fs.unlink(oldPath, () => {});
    }

    const relativePath = path.relative(UPLOADS_DIR, req.file.path).replace(/\\/g, '/');
    estudiante.fotoPerfil = relativePath;
    await estudiante.save();

    const fotoUrl = `/uploads/${relativePath}`;

    return res.status(200).json({
      mensaje: 'Foto de perfil actualizada correctamente',
      data: { fotoPerfil: fotoUrl },
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al subir la foto de perfil',
      error: error.message,
    });
  }
}

async function deleteFotoPerfil(req, res) {
  try {
    const Estudiante = require('../models/estudiante');
    const estudiante = await Estudiante.findById(req.usuario.sub);

    if (!estudiante) {
      return res.status(404).json({ mensaje: 'El estudiante no existe' });
    }

    if (estudiante.fotoPerfil) {
      const filePath = path.join(UPLOADS_DIR, estudiante.fotoPerfil);
      fs.unlink(filePath, () => {});
    }

    estudiante.fotoPerfil = '';
    await estudiante.save();

    return res.status(200).json({
      mensaje: 'Foto de perfil eliminada correctamente',
      data: { fotoPerfil: '' },
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al eliminar la foto de perfil',
      error: error.message,
    });
  }
}

async function uploadHojaVida(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se recibió ningún archivo' });
    }

    const estudianteId = req.usuario.sub;
    const Estudiante = require('../models/estudiante');
    const estudiante = await Estudiante.findById(estudianteId);

    if (!estudiante) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ mensaje: 'El estudiante no existe' });
    }

    if (estudiante.hojaVida) {
      const oldPath = resolveStoredUpload(estudiante.hojaVida, 'cvs');
      if (oldPath) fs.unlink(oldPath, () => {});
    }

    const relativePath = path.relative(UPLOADS_DIR, req.file.path).replace(/\\/g, '/');
    estudiante.hojaVida = relativePath;
    estudiante.hojaVidaNombre = req.file.originalname;
    await estudiante.save();

    return res.status(200).json({
      mensaje: 'Hoja de vida subida correctamente',
      data: { hojaVida: '/api/estudiantes/me/cv', hojaVidaNombre: req.file.originalname },
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al subir la hoja de vida',
      error: error.message,
    });
  }
}

async function deleteHojaVida(req, res) {
  try {
    const Estudiante = require('../models/estudiante');
    const estudiante = await Estudiante.findById(req.usuario.sub);

    if (!estudiante) {
      return res.status(404).json({ mensaje: 'El estudiante no existe' });
    }

    if (estudiante.hojaVida) {
      const filePath = resolveStoredUpload(estudiante.hojaVida, 'cvs');
      if (filePath) fs.unlink(filePath, () => {});
    }

    estudiante.hojaVida = '';
    estudiante.hojaVidaNombre = '';
    await estudiante.save();

    return res.status(200).json({
      mensaje: 'Hoja de vida eliminada correctamente',
      data: { hojaVida: '', hojaVidaNombre: '' },
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al eliminar la hoja de vida',
      error: error.message,
    });
  }
}

async function downloadHojaVida(req, res) {
  try {
    const Estudiante = require('../models/estudiante');
    const estudiante = await Estudiante.findById(req.usuario.sub).select('hojaVida hojaVidaNombre');

    if (!estudiante || !estudiante.hojaVida) {
      return res.status(404).json({ mensaje: 'No hay una hoja de vida disponible' });
    }

    const filePath = resolveStoredUpload(estudiante.hojaVida, 'cvs');
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ mensaje: 'La hoja de vida no está disponible' });
    }

    return res.download(
      filePath,
      safeDownloadName(estudiante.hojaVidaNombre, 'hoja-de-vida.pdf'),
    );
  } catch {
    return res.status(500).json({ mensaje: 'Error al descargar la hoja de vida' });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        mensaje: 'La contraseña actual y la nueva son obligatorias',
      });
    }

    const resultado = await cambiarPassword(req.usuario.sub, currentPassword, newPassword);

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al cambiar la contraseña',
      error: error.message,
    });
  }
}

module.exports = {
  getMiPerfil,
  updateMiPerfil,
  getMisSugerencias,
  uploadFotoPerfil,
  deleteFotoPerfil,
  uploadHojaVida,
  deleteHojaVida,
  downloadHojaVida,
  changePassword,
};
