const {
  listarOfertas,
  obtenerOfertaPorId,
  crearOferta: crearOfertaService,
  actualizarOferta: actualizarOfertaService,
  eliminarOferta: eliminarOfertaService,
} = require('../services/ofertaService');
const { getStatusCode } = require('../utils/errors');
const { buildErrorResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

async function getOfertas(req, res) {
  try {
    const ofertas = await listarOfertas(req.query);
    return res.status(200).json(ofertas);
  } catch (error) {
    logger.error(`[getOfertas] ${error.message}`);
    return res.status(500).json(buildErrorResponse('Error al listar ofertas', error));
  }
}

async function getOfertaById(req, res) {
  try {
    const oferta = await obtenerOfertaPorId(req.params.id);

    if (!oferta) {
      return res.status(404).json({ mensaje: 'Oferta no encontrada' });
    }

    return res.status(200).json(oferta);
  } catch (error) {
    logger.error(`[getOfertaById] ${error.message}`);
    return res.status(500).json(buildErrorResponse('Error al consultar oferta', error));
  }
}

async function crearOferta(req, res) {
  try {
    const oferta = await crearOfertaService(req.body);
    return res.status(201).json({
      mensaje: 'Oferta creada correctamente',
      data: oferta,
    });
  } catch (error) {
    logger.error(`[crearOferta] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al crear oferta', error));
  }
}

async function actualizarOferta(req, res) {
  try {
    const oferta = await actualizarOfertaService(req.params.id, req.body);
    return res.status(200).json({
      mensaje: 'Oferta actualizada correctamente',
      data: oferta,
    });
  } catch (error) {
    logger.error(`[actualizarOferta] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al actualizar oferta', error));
  }
}

async function eliminarOferta(req, res) {
  try {
    const oferta = await eliminarOfertaService(req.params.id);
    return res.status(200).json({
      mensaje: 'Oferta eliminada correctamente',
      data: oferta,
    });
  } catch (error) {
    logger.error(`[eliminarOferta] ${error.message}`);
    return res.status(getStatusCode(error)).json(buildErrorResponse('Error al eliminar oferta', error));
  }
}

module.exports = {
  getOfertas,
  getOfertaById,
  crearOferta,
  actualizarOferta,
  eliminarOferta,
};
