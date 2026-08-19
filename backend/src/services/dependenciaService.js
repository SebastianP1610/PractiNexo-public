const mongoose = require('mongoose');
const Dependencia = require('../models/dependencia');
const { crearError } = require('../utils/errors');

async function listarDependencias() {
  return Dependencia.find().sort({ created_at: -1 });
}

async function crearDependencia(data) {
  const { nombre, descripcion, correoContacto, telefonoContacto, ubicacion, estado } = data;

  if (!nombre) {
    throw crearError('El nombre es obligatorio');
  }

  const dependenciaExistente = await Dependencia.findOne({
    nombre: String(nombre).trim(),
  });

  if (dependenciaExistente) {
    throw crearError('Ya existe una dependencia con ese nombre', 409);
  }

  return Dependencia.create({
    nombre: String(nombre).trim(),
    descripcion: descripcion ? String(descripcion).trim() : '',
    correoContacto: correoContacto ? String(correoContacto).trim().toLowerCase() : '',
    telefonoContacto: telefonoContacto ? String(telefonoContacto).trim() : '',
    ubicacion: ubicacion ? String(ubicacion).trim() : '',
    estado: estado || 'ACTIVA',
  });
}

async function actualizarDependencia(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('El id de la dependencia no es valido');
  }

  const dependencia = await Dependencia.findById(id);

  if (!dependencia) {
    throw new Error('La dependencia no existe');
  }

  if (data.nombre) {
    const nombreNormalizado = String(data.nombre).trim();

    const dependenciaConMismoNombre = await Dependencia.findOne({
      nombre: nombreNormalizado,
      _id: { $ne: id },
    });

    if (dependenciaConMismoNombre) {
      throw new Error('Ya existe una dependencia con ese nombre');
    }

    dependencia.nombre = nombreNormalizado;
  }

  if (data.descripcion !== undefined) {
    dependencia.descripcion = String(data.descripcion || '').trim();
  }

  if (data.correoContacto !== undefined) {
    dependencia.correoContacto = String(data.correoContacto || '').trim().toLowerCase();
  }

  if (data.telefonoContacto !== undefined) {
    dependencia.telefonoContacto = String(data.telefonoContacto || '').trim();
  }

  if (data.ubicacion !== undefined) {
    dependencia.ubicacion = String(data.ubicacion || '').trim();
  }

  if (data.estado !== undefined) {
    dependencia.estado = data.estado;
  }

  await dependencia.save();
  return dependencia;
}

async function eliminarDependencia(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('El id de la dependencia no es valido');
  }

  const dependencia = await Dependencia.findByIdAndDelete(id);

  if (!dependencia) {
    throw new Error('La dependencia no existe');
  }

  return dependencia;
}

module.exports = {
  listarDependencias,
  crearDependencia,
  actualizarDependencia,
  eliminarDependencia,
};