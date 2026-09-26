const {
  listarProgramas,
  crearPrograma: crearProgramaService,
  actualizarPrograma: actualizarProgramaService,
  eliminarPrograma: eliminarProgramaService,
} = require('../services/programaAcademicoService');
const { getStatusCode } = require('../utils/errors');
const { buildErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

const CACHE_KEY = 'programas:list';

async function getProgramas(req, res) {
  try {
    const cached = cache.obtener(CACHE_KEY);
    if (cached) return res.status(200).json(cached);

    const programas = await listarProgramas(req.query);
    cache.guardar(CACHE_KEY, programas, 60000);
    return res.status(200).json(programas);
  } catch (error) {
    logger.error(`[getProgramas] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al listar programas académicos', error),
    );
  }
}

async function crearPrograma(req, res) {
  try {
    const programa = await crearProgramaService(req.body);
    cache.invalidar('programas');
    return res.status(201).json({
      mensaje: 'Programa académico creado correctamente',
      data: programa,
    });
  } catch (error) {
    logger.error(`[crearPrograma] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al crear programa académico', error),
    );
  }
}

async function actualizarPrograma(req, res) {
  try {
    const programa = await actualizarProgramaService(req.params.id, req.body);
    cache.invalidar('programas');
    return res.status(200).json({
      mensaje: 'Programa académico actualizado correctamente',
      data: programa,
    });
  } catch (error) {
    logger.error(`[actualizarPrograma] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al actualizar programa académico', error),
    );
  }
}

async function eliminarPrograma(req, res) {
  try {
    const programa = await eliminarProgramaService(req.params.id);
    cache.invalidar('programas');
    return res.status(200).json({
      mensaje: 'Programa académico eliminado correctamente',
      data: programa,
    });
  } catch (error) {
    logger.error(`[eliminarPrograma] ${error.message}`);
    return res.status(getStatusCode(error)).json(
      buildErrorResponse('Error al eliminar programa académico', error),
    );
  }
}

module.exports = {
  getProgramas,
  crearPrograma,
  actualizarPrograma,
  eliminarPrograma,
};
