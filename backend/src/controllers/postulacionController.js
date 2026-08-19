const {
  crearPostulacion,
  listarPostulacionesPorEstudiante,
  cancelarPostulacion,
  listarPostulacionesParaAdmin,
  obtenerPostulacionPorIdParaAdmin,
  actualizarEstadoPostulacion,
} = require('../services/postulacionService');
const { getStatusCode } = require('../utils/errors');
const { buildErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');
const fs = require('fs');
const { resolveStoredUpload, safeDownloadName } = require('../utils/uploadPath');

async function postularmeAOferta(req, res) {
  try {
    const postulacion = await crearPostulacion(req.usuario.sub, req.body);

    return res.status(201).json({
      mensaje: 'Postulacion creada correctamente',
      data: postulacion,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al crear postulacion',
      error: error.message,
    });
  }
}

async function getMisPostulaciones(req, res) {
  try {
    const postulaciones = await listarPostulacionesPorEstudiante(req.usuario.sub);

    return res.status(200).json({
      mensaje: 'Postulaciones obtenidas correctamente',
      data: postulaciones,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al obtener postulaciones',
      error: error.message,
    });
  }
}

async function deleteMiPostulacion(req, res) {
  try {
    const postulacion = await cancelarPostulacion(
      req.params.id,
      req.usuario.sub,
    );

    return res.status(200).json({
      mensaje: 'Postulacion cancelada correctamente',
      data: postulacion,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al cancelar postulacion',
      error: error.message,
    });
  }
}

async function listarPostulacionesAdmin(req, res) {
  try {
    const resultado = await listarPostulacionesParaAdmin(req.query);
    return res.status(200).json({
      mensaje: 'Postulaciones obtenidas correctamente',
      data: resultado.data,
      total: resultado.total,
      page: resultado.page,
      pages: resultado.pages,
    });
  } catch (error) {
    logger.error(`[listarPostulacionesAdmin] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al listar postulaciones', error),
    );
  }
}

async function detallePostulacionAdmin(req, res) {
  try {
    const postulacion = await obtenerPostulacionPorIdParaAdmin(req.params.id);
    return res.status(200).json({
      mensaje: 'Postulacion obtenida correctamente',
      data: postulacion,
    });
  } catch (error) {
    logger.error(`[detallePostulacionAdmin] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al obtener postulacion', error),
    );
  }
}

async function cambiarEstadoPostulacionAdmin(req, res) {
  try {
    const { estado, observacion } = req.body || {};
    const postulacion = await actualizarEstadoPostulacion(
      req.params.id,
      estado,
      observacion,
    );
    return res.status(200).json({
      mensaje: 'Postulacion actualizada correctamente',
      data: postulacion,
    });
  } catch (error) {
    logger.error(`[cambiarEstadoPostulacionAdmin] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al actualizar postulacion', error),
    );
  }
}

async function downloadHojaVidaPostulacion(req, res) {
  try {
    const postulacion = await obtenerPostulacionPorIdParaAdmin(req.params.id);
    const estudiante = postulacion.estudianteId;

    if (!estudiante?.hojaVida) {
      return res.status(404).json({ mensaje: 'El estudiante no tiene una hoja de vida disponible' });
    }

    const filePath = resolveStoredUpload(estudiante.hojaVida, 'cvs');
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ mensaje: 'La hoja de vida no está disponible' });
    }

    return res.download(
      filePath,
      safeDownloadName(estudiante.hojaVidaNombre, 'hoja-de-vida.pdf'),
    );
  } catch (error) {
    logger.error(`[downloadHojaVidaPostulacion] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al descargar hoja de vida', error),
    );
  }
}

module.exports = {
  postularmeAOferta,
  getMisPostulaciones,
  deleteMiPostulacion,
  listarPostulacionesAdmin,
  detallePostulacionAdmin,
  cambiarEstadoPostulacionAdmin,
  downloadHojaVidaPostulacion,
};
