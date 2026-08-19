const {
  listarCategorias,
  crearCategoria: crearCategoriaService,
  actualizarCategoria: actualizarCategoriaService,
  eliminarCategoria: eliminarCategoriaService,
} = require('../services/categoriaService');
const { getStatusCode } = require('../utils/errors');
const { buildErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

const CACHE_KEY = 'categorias:list';

async function getCategorias(_req, res) {
  try {
    const cached = cache.obtener(CACHE_KEY);
    if (cached) return res.status(200).json(cached);

    const categorias = await listarCategorias();
    cache.guardar(CACHE_KEY, categorias, 60000);
    return res.status(200).json(categorias);
  } catch (error) {
    logger.error(`[getCategorias] ${error.message}`);
    return res.status(500).json(buildErrorResponse('Error al listar categorias', error));
  }
}

async function crearCategoria(req, res) {
  try {
    const categoria = await crearCategoriaService(req.body);
    cache.invalidar('categorias');
    return res.status(201).json({
      mensaje: 'Categoria creada correctamente',
      data: categoria,
    });
  } catch (error) {
    logger.error(`[crearCategoria] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al crear categoria', error));
  }
}

async function actualizarCategoria(req, res) {
  try {
    const categoria = await actualizarCategoriaService(req.params.id, req.body);
    cache.invalidar('categorias');
    return res.status(200).json({
      mensaje: 'Categoria actualizada correctamente',
      data: categoria,
    });
  } catch (error) {
    logger.error(`[actualizarCategoria] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al actualizar categoria', error));
  }
}

async function eliminarCategoria(req, res) {
  try {
    const categoria = await eliminarCategoriaService(req.params.id);
    cache.invalidar('categorias');
    return res.status(200).json({
      mensaje: 'Categoria eliminada correctamente',
      data: categoria,
    });
  } catch (error) {
    logger.error(`[eliminarCategoria] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al eliminar categoria', error));
  }
}

module.exports = {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
