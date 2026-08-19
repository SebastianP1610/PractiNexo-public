const mongoose = require('mongoose');
const Oferta = require('../models/oferta');
const Dependencia = require('../models/dependencia');
const Categoria = require('../models/categoria');
const { crearError } = require('../utils/errors');
const validar = require('./ofertaValidators');

function normalizarStringArray(valor) {
  if (Array.isArray(valor)) {
    return valor.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof valor === 'string') {
    return valor
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).trim());
}

function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;
  return phoneRegex.test(String(phone).trim());
}

async function listarOfertas(filtros = {}) {
  const query = {};

  if (filtros.tipo) {
    query.tipoOportunidad = filtros.tipo;
  }

  if (filtros.programa) {
    query.programaAcademico = { $regex: filtros.programa, $options: 'i' };
  }

  if (filtros.dependencia) {
    query.dependenciaId = filtros.dependencia;
  }

  if (filtros.categoria) {
    query.categoriaId = filtros.categoria;
  }

  if (filtros.estadoVigencia) {
    query.estadoVigencia = filtros.estadoVigencia;
  }

  if (filtros.disponibilidad) {
    query.disponibilidad = { $regex: filtros.disponibilidad, $options: 'i' };
  }

  if (filtros.areaInteres) {
    query.areaInteres = { $regex: filtros.areaInteres, $options: 'i' };
  }

  if (filtros.palabrasClave) {
    const palabras = String(filtros.palabrasClave)
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    if (palabras.length) {
      query.$or = palabras.map((palabra) => ({
        palabrasClave: { $regex: palabra, $options: 'i' },
      }));
    }
  }

  if (filtros.soloActivas === 'true') {
    query.estadoVigencia = 'ACTIVA';
  }

  const page = Math.max(1, parseInt(filtros.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(filtros.limit, 10) || 0));

  const baseQuery = Oferta.find(query)
    .populate('dependenciaId', 'nombre')
    .populate('categoriaId', 'nombre');

  if (limit > 0) {
    const total = await Oferta.countDocuments(query);
    const data = await baseQuery
      .sort({ fechaPublicacion: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  return baseQuery.sort({ fechaPublicacion: -1 });
}

async function obtenerOfertaPorId(id) {
  return Oferta.findById(id)
    .populate('dependenciaId', 'nombre')
    .populate('categoriaId', 'nombre');
}

async function crearOferta(data) {
  const {
    titulo,
    descripcion,
    tipoOportunidad,
    requisitos,
    fechaCierre,
    estadoVigencia,
    contacto,
    programaAcademico,
    areaInteres,
    disponibilidad,
    palabrasClave,
    dependenciaId,
    categoriaId,
  } = data;

  if (!titulo || !descripcion || !tipoOportunidad || !contacto || !dependenciaId || !categoriaId) {
    throw crearError(
      'Titulo, descripcion, tipoOportunidad, contacto, dependenciaId y categoriaId son obligatorios',
    );
  }

  if (titulo.trim().length < 5) {
    throw crearError('El titulo debe tener al menos 5 caracteres');
  }

  if (descripcion.trim().length < 20) {
    throw crearError('La descripcion debe tener al menos 20 caracteres');
  }

  if (!['PRACTICA', 'SERVICIO_SOCIAL'].includes(tipoOportunidad)) {
    throw crearError('tipoOportunidad debe ser PRACTICA o SERVICIO_SOCIAL');
  }

  const contactoTrim = String(contacto).trim();
  const esEmail = contactoTrim.includes('@');
  if (esEmail && !isValidEmail(contactoTrim)) {
    throw crearError('El correo de contacto no tiene un formato valido');
  }
  if (!esEmail && !isValidPhone(contactoTrim)) {
    throw crearError('El telefono de contacto no tiene un formato valido');
  }

  if (!mongoose.Types.ObjectId.isValid(dependenciaId)) {
    throw crearError('dependenciaId no es valido');
  }

  if (!mongoose.Types.ObjectId.isValid(categoriaId)) {
    throw crearError('categoriaId no es valido');
  }

  const dependencia = await Dependencia.findById(dependenciaId);
  if (!dependencia) {
    throw crearError('La dependencia no existe', 404);
  }

  const categoria = await Categoria.findById(categoriaId);
  if (!categoria) {
    throw crearError('La categoria no existe', 404);
  }

  if (fechaCierre) {
    const fechaCierreDate = new Date(fechaCierre);
    if (Number.isNaN(fechaCierreDate.getTime())) {
      throw crearError('La fecha de cierre no es una fecha valida');
    }
    const ahora = new Date();
    if (fechaCierreDate < ahora) {
      throw crearError('La fecha de cierre no puede ser anterior a la fecha actual');
    }
  }

  if (estadoVigencia && !['ACTIVA', 'INACTIVA', 'CERRADA', 'VENCIDA'].includes(estadoVigencia)) {
    throw crearError('estadoVigencia debe ser ACTIVA, INACTIVA, CERRADA o VENCIDA');
  }

  const requisitosNormalizados = normalizarStringArray(requisitos);
  const palabrasNormalizadas = normalizarStringArray(palabrasClave);

  return Oferta.create({
    titulo: String(titulo).trim(),
    descripcion: String(descripcion).trim(),
    tipoOportunidad,
    requisitos: requisitosNormalizados,
    fechaCierre: fechaCierre || null,
    estadoVigencia: estadoVigencia || 'ACTIVA',
    contacto: contactoTrim,
    programaAcademico: programaAcademico ? String(programaAcademico).trim() : '',
    areaInteres: areaInteres ? String(areaInteres).trim() : '',
    disponibilidad: disponibilidad ? String(disponibilidad).trim() : '',
    palabrasClave: palabrasNormalizadas,
    dependenciaId,
    categoriaId,
  });
}

async function actualizarOferta(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError('El id de la oferta no es valido', 400);
  }

  const oferta = await Oferta.findById(id);

  if (!oferta) {
    throw crearError('La oferta no existe', 404);
  }

  if (data.titulo !== undefined) oferta.titulo = validar.validarTitulo(data.titulo);
  if (data.descripcion !== undefined) oferta.descripcion = validar.validarDescripcion(data.descripcion);
  if (data.tipoOportunidad !== undefined) oferta.tipoOportunidad = validar.validarTipoOportunidad(data.tipoOportunidad);
  if (data.requisitos !== undefined) oferta.requisitos = validar.normalizarRequisitos(data.requisitos);
  if (data.fechaCierre !== undefined) oferta.fechaCierre = validar.validarFechaCierre(data.fechaCierre);
  if (data.estadoVigencia !== undefined) oferta.estadoVigencia = validar.validarEstadoVigencia(data.estadoVigencia);
  if (data.contacto !== undefined) oferta.contacto = validar.validarContacto(data.contacto);

  if (data.programaAcademico !== undefined) {
    oferta.programaAcademico = validar.normalizarTextoOferta(data.programaAcademico);
  }
  if (data.areaInteres !== undefined) {
    oferta.areaInteres = validar.normalizarTextoOferta(data.areaInteres);
  }
  if (data.disponibilidad !== undefined) {
    oferta.disponibilidad = validar.normalizarTextoOferta(data.disponibilidad);
  }
  if (data.palabrasClave !== undefined) {
    oferta.palabrasClave = validar.normalizarPalabrasClave(data.palabrasClave);
  }

  if (data.dependenciaId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(data.dependenciaId)) {
      throw crearError('dependenciaId no es valido', 400);
    }
    const dependencia = await Dependencia.findById(data.dependenciaId);
    if (!dependencia) throw crearError('La dependencia no existe', 404);
    oferta.dependenciaId = data.dependenciaId;
  }

  if (data.categoriaId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(data.categoriaId)) {
      throw crearError('categoriaId no es valido', 400);
    }
    const categoria = await Categoria.findById(data.categoriaId);
    if (!categoria) throw crearError('La categoria no existe', 404);
    oferta.categoriaId = data.categoriaId;
  }

  await oferta.save();
  return oferta;
}

async function eliminarOferta(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('El id de la oferta no es valido');
  }

  const oferta = await Oferta.findByIdAndDelete(id);

  if (!oferta) {
    throw new Error('La oferta no existe');
  }

  return oferta;
}

module.exports = {
  listarOfertas,
  obtenerOfertaPorId,
  crearOferta,
  actualizarOferta,
  eliminarOferta,
};