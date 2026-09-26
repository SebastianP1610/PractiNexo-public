const {
  listarEstudiantesAdmin,
  obtenerEstudianteAdmin,
  crearEstudianteAdmin,
  actualizarEstudianteAdmin,
  eliminarEstudianteAdmin,
} = require('../services/estudianteAdminService');
const { getStatusCode } = require('../utils/errors');
const { buildErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

async function getEstudiantes(req, res) {
  try {
    const result = await listarEstudiantesAdmin(req.query);
    return res.status(200).json(result);
  } catch (error) {
    logger.error(`[getEstudiantes] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al listar estudiantes', error),
    );
  }
}

async function getEstudiantePorId(req, res) {
  try {
    const estudiante = await obtenerEstudianteAdmin(req.params.id);
    return res.status(200).json(estudiante);
  } catch (error) {
    logger.error(`[getEstudiantePorId] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al obtener estudiante', error),
    );
  }
}

async function crearEstudiante(req, res) {
  try {
    const estudiante = await crearEstudianteAdmin(req.body);
    return res.status(201).json({
      mensaje: 'Estudiante creado correctamente',
      data: estudiante,
    });
  } catch (error) {
    logger.error(`[crearEstudiante] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al crear estudiante', error),
    );
  }
}

async function actualizarEstudiante(req, res) {
  try {
    const estudiante = await actualizarEstudianteAdmin(req.params.id, req.body);
    return res.status(200).json({
      mensaje: 'Estudiante actualizado correctamente',
      data: estudiante,
    });
  } catch (error) {
    logger.error(`[actualizarEstudiante] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al actualizar estudiante', error),
    );
  }
}

async function eliminarEstudiante(req, res) {
  try {
    const estudiante = await eliminarEstudianteAdmin(req.params.id);
    return res.status(200).json({
      mensaje: 'Estudiante eliminado correctamente',
      data: estudiante,
    });
  } catch (error) {
    logger.error(`[eliminarEstudiante] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al eliminar estudiante', error),
    );
  }
}

module.exports = {
  getEstudiantes,
  getEstudiantePorId,
  crearEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
};
