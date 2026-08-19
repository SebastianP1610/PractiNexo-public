const mongoose = require('mongoose');
const Postulacion = require('../models/postulacion');
const Estudiante = require('../models/estudiante');
const Oferta = require('../models/oferta');
const { crearError } = require('../utils/errors');

const ESTADOS_VALIDOS = ['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA', 'CANCELADA'];

const TRANSICIONES = {
  PENDIENTE: ['EN_REVISION', 'ACEPTADA', 'RECHAZADA'],
  EN_REVISION: ['ACEPTADA', 'RECHAZADA', 'PENDIENTE'],
  ACEPTADA: ['RECHAZADA', 'EN_REVISION'],
  RECHAZADA: ['ACEPTADA', 'EN_REVISION'],
  CANCELADA: [],
};

const ESTUDIANTE_POPULATE = {
  path: 'estudianteId',
  select:
    'nombre correo programaAcademico areaInteres disponibilidad estado telefono fotoPerfil hojaVida hojaVidaNombre redesSociales',
};

const OFERTA_POPULATE = {
  path: 'ofertaId',
  select: 'titulo tipoOportunidad estadoVigencia fechaCierre dependenciaId',
  populate: { path: 'dependenciaId', select: 'nombre' },
};

function puedeTransitar(estadoActual, nuevoEstado) {
  if (!ESTADOS_VALIDOS.includes(estadoActual) || !ESTADOS_VALIDOS.includes(nuevoEstado)) {
    return false;
  }
  if (nuevoEstado === 'CANCELADA') return false;
  if (estadoActual === 'CANCELADA') return false;
  return (TRANSICIONES[estadoActual] || []).includes(nuevoEstado);
}

async function crearPostulacion(estudianteId, data) {
  const { ofertaId, observacion } = data;

  if (!ofertaId) {
    throw new Error('ofertaId es obligatorio');
  }

  if (!mongoose.Types.ObjectId.isValid(estudianteId)) {
    throw new Error('El id del estudiante no es valido');
  }

  if (!mongoose.Types.ObjectId.isValid(ofertaId)) {
    throw new Error('El id de la oferta no es valido');
  }

  const estudiante = await Estudiante.findById(estudianteId);
  if (!estudiante || estudiante.estado !== 'ACTIVO') {
    throw new Error('El estudiante no existe o no esta activo');
  }

  const oferta = await Oferta.findById(ofertaId);
  if (!oferta) {
    throw new Error('La oferta no existe');
  }

  if (oferta.estadoVigencia !== 'ACTIVA') {
    throw new Error('La oferta no esta activa');
  }

  if (oferta.fechaCierre && new Date(oferta.fechaCierre) <= new Date()) {
    throw new Error('La oferta ya se encuentra vencida');
  }

  const postulacionExistente = await Postulacion.findOne({
    estudianteId,
    ofertaId,
    estado: { $ne: 'CANCELADA' },
  });

  if (postulacionExistente) {
    throw new Error('El estudiante ya se postulo a esta oferta');
  }

  return Postulacion.create({
    estudianteId,
    ofertaId,
    observacion: observacion ? String(observacion).trim() : '',
  });
}

async function listarPostulacionesPorEstudiante(estudianteId) {
  return Postulacion.find({ estudianteId })
    .populate('ofertaId', 'titulo descripcion tipoOportunidad estadoVigencia fechaCierre')
    .sort({ fechaPostulacion: -1 });
}

/**
 * Cancela una postulacion del estudiante. Solo el dueno puede cancelarla,
 * y unicamente si su estado es PENDIENTE o EN_REVISION.
 */
async function cancelarPostulacion(postulacionId, estudianteId) {
  if (!mongoose.Types.ObjectId.isValid(postulacionId)) {
    throw new Error('El id de la postulacion no es valido');
  }
  if (!mongoose.Types.ObjectId.isValid(estudianteId)) {
    throw new Error('El id del estudiante no es valido');
  }

  const postulacion = await Postulacion.findById(postulacionId);
  if (!postulacion) {
    throw new Error('La postulacion no existe');
  }
  if (String(postulacion.estudianteId) !== String(estudianteId)) {
    throw new Error('No tienes permiso para cancelar esta postulacion');
  }
  if (!['PENDIENTE', 'EN_REVISION'].includes(postulacion.estado)) {
    throw new Error(
      `No se puede cancelar una postulacion en estado ${postulacion.estado}`,
    );
  }

  postulacion.estado = 'CANCELADA';
  postulacion.fechaCancelacion = new Date();
  await postulacion.save();
  return postulacion;
}

module.exports = {
  crearPostulacion,
  listarPostulacionesPorEstudiante,
  cancelarPostulacion,
  puedeTransitar,
  listarPostulacionesParaAdmin,
  obtenerPostulacionPorIdParaAdmin,
  actualizarEstadoPostulacion,
};

async function listarPostulacionesParaAdmin(filtros = {}) {
  const query = {};

  if (filtros.estado) {
    query.estado = filtros.estado;
  }
  if (filtros.ofertaId) {
    if (!mongoose.Types.ObjectId.isValid(filtros.ofertaId)) {
      throw crearError('ofertaId no es valido', 400);
    }
    query.ofertaId = filtros.ofertaId;
  }
  if (filtros.estudianteId) {
    if (!mongoose.Types.ObjectId.isValid(filtros.estudianteId)) {
      throw crearError('estudianteId no es valido', 400);
    }
    query.estudianteId = filtros.estudianteId;
  }

  const page = Math.max(1, parseInt(filtros.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filtros.limit, 10) || 0));

  const baseQuery = Postulacion.find(query)
    .populate(ESTUDIANTE_POPULATE)
    .populate(OFERTA_POPULATE)
    .sort({ fechaPostulacion: -1 });

  if (limit > 0) {
    const total = await Postulacion.countDocuments(query);
    const data = await baseQuery.skip((page - 1) * limit).limit(limit);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  return { data: await baseQuery, total: await Postulacion.countDocuments(query), page: 1, pages: 1 };
}

async function obtenerPostulacionPorIdParaAdmin(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError('El id de la postulacion no es valido', 400);
  }
  const postulacion = await Postulacion.findById(id)
    .populate(ESTUDIANTE_POPULATE)
    .populate(OFERTA_POPULATE);
  if (!postulacion) {
    throw crearError('La postulacion no existe', 404);
  }
  return postulacion;
}

async function actualizarEstadoPostulacion(id, nuevoEstado, observacion) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError('El id de la postulacion no es valido', 400);
  }
  if (!nuevoEstado || !ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw crearError('Estado no valido', 400);
  }

  const postulacion = await Postulacion.findById(id);
  if (!postulacion) {
    throw crearError('La postulacion no existe', 404);
  }

  if (!puedeTransitar(postulacion.estado, nuevoEstado)) {
    throw crearError(
      `No se puede cambiar de ${postulacion.estado} a ${nuevoEstado}`,
      400,
    );
  }

  postulacion.estado = nuevoEstado;
  if (typeof observacion === 'string' && observacion.trim()) {
    postulacion.observacion = observacion.trim();
  }
  await postulacion.save();

  const actualizada = await Postulacion.findById(id)
    .populate(ESTUDIANTE_POPULATE)
    .populate(OFERTA_POPULATE);
  return actualizada;
}