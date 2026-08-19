const {
  listarDependencias,
  crearDependencia: crearDependenciaService,
  actualizarDependencia: actualizarDependenciaService,
  eliminarDependencia: eliminarDependenciaService,
} = require('../services/dependenciaService');
const { getStatusCode } = require('../utils/errors');
const { buildErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

const CACHE_KEY = 'dependencias:list';

async function getDependencias(_req, res) {
  try {
    const cached = cache.obtener(CACHE_KEY);
    if (cached) return res.status(200).json(cached);

    const dependencias = await listarDependencias();
    cache.guardar(CACHE_KEY, dependencias, 60000);
    return res.status(200).json(dependencias);
  } catch (error) {
    logger.error(`[getDependencias] ${error.message}`);
    return res.status(500).json(buildErrorResponse('Error al listar dependencias', error));
  }
}

async function crearDependencia(req, res) {
  try {
    const dependencia = await crearDependenciaService(req.body);
    cache.invalidar('dependencias');
    return res.status(201).json({
      mensaje: 'Dependencia creada correctamente',
      data: dependencia,
    });
  } catch (error) {
    logger.error(`[crearDependencia] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al crear dependencia', error));
  }
}

async function actualizarDependencia(req, res) {
  try {
    const dependencia = await actualizarDependenciaService(req.params.id, req.body);
    cache.invalidar('dependencias');
    return res.status(200).json({
      mensaje: 'Dependencia actualizada correctamente',
      data: dependencia,
    });
  } catch (error) {
    logger.error(`[actualizarDependencia] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al actualizar dependencia', error));
  }
}

async function eliminarDependencia(req, res) {
  try {
    const dependencia = await eliminarDependenciaService(req.params.id);
    cache.invalidar('dependencias');
    return res.status(200).json({
      mensaje: 'Dependencia eliminada correctamente',
      data: dependencia,
    });
  } catch (error) {
    logger.error(`[eliminarDependencia] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al eliminar dependencia', error));
  }
}

module.exports = {
  getDependencias,
  crearDependencia,
  actualizarDependencia,
  eliminarDependencia,
};
