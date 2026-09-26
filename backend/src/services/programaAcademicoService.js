const mongoose = require('mongoose');
const ProgramaAcademico = require('../models/programaAcademico');
const { crearError } = require('../utils/errors');
const {
  validarNombrePrograma,
  validarCodigoPrograma,
  validarNivelAcademico,
  validarEstadoPrograma,
} = require('./programaAcademicoValidators');

function normalizarTexto(valor) {
  return valor !== undefined ? String(valor || '').trim() : '';
}

async function listarProgramas(filtros = {}) {
  const query = {};

  if (filtros.estado) {
    query.estado = validarEstadoPrograma(filtros.estado);
  }
  if (filtros.nivelAcademico) {
    query.nivelAcademico = validarNivelAcademico(filtros.nivelAcademico);
  }
  if (filtros.facultad) {
    query.facultad = String(filtros.facultad).trim();
  }

  return ProgramaAcademico.find(query).sort({ nombre: 1 });
}

async function obtenerProgramaPorId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError('El id del programa no es válido', 400);
  }

  const programa = await ProgramaAcademico.findById(id);
  if (!programa) {
    throw crearError('El programa académico no existe', 404);
  }

  return programa;
}

async function crearPrograma(data) {
  const nombre = validarNombrePrograma(data.nombre);
  const codigo = validarCodigoPrograma(data.codigo);

  const existente = await ProgramaAcademico.findOne({
    $or: [{ nombre }, ...(codigo ? [{ codigo }] : [])],
  });

  if (existente) {
    throw crearError('Ya existe un programa académico con ese nombre o código', 409);
  }

  return ProgramaAcademico.create({
    nombre,
    codigo,
    nivelAcademico: validarNivelAcademico(data.nivelAcademico),
    facultad: normalizarTexto(data.facultad),
    descripcion: normalizarTexto(data.descripcion),
    estado: validarEstadoPrograma(data.estado),
  });
}

async function actualizarPrograma(id, data) {
  const programa = await obtenerProgramaPorId(id);

  if (data.nombre !== undefined) {
    const nombre = validarNombrePrograma(data.nombre);
    const conflicto = await ProgramaAcademico.findOne({
      nombre,
      _id: { $ne: id },
    });
    if (conflicto) {
      throw crearError('Ya existe un programa académico con ese nombre', 409);
    }
    programa.nombre = nombre;
  }

  if (data.codigo !== undefined) {
    const codigo = validarCodigoPrograma(data.codigo);
    if (codigo) {
      const conflicto = await ProgramaAcademico.findOne({
        codigo,
        _id: { $ne: id },
      });
      if (conflicto) {
        throw crearError('Ya existe un programa académico con ese código', 409);
      }
    }
    programa.codigo = codigo;
  }

  if (data.nivelAcademico !== undefined) {
    programa.nivelAcademico = validarNivelAcademico(data.nivelAcademico);
  }
  if (data.facultad !== undefined) {
    programa.facultad = normalizarTexto(data.facultad);
  }
  if (data.descripcion !== undefined) {
    programa.descripcion = normalizarTexto(data.descripcion);
  }
  if (data.estado !== undefined) {
    programa.estado = validarEstadoPrograma(data.estado);
  }

  await programa.save();
  return programa;
}

async function eliminarPrograma(id) {
  const programa = await obtenerProgramaPorId(id);
  await ProgramaAcademico.findByIdAndDelete(id);
  return programa;
}

module.exports = {
  listarProgramas,
  obtenerProgramaPorId,
  crearPrograma,
  actualizarPrograma,
  eliminarPrograma,
};
