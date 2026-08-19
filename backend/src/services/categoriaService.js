const mongoose = require('mongoose');
const Categoria = require('../models/categoria');
const { crearError } = require('../utils/errors');

async function listarCategorias() {
  return Categoria.find().sort({ created_at: -1 });
}

async function crearCategoria(data) {
  const { nombre, descripcion, estado } = data;

  if (!nombre) {
    throw crearError('El nombre es obligatorio');
  }

  const categoriaExistente = await Categoria.findOne({
    nombre: String(nombre).trim(),
  });

  if (categoriaExistente) {
    throw crearError('Ya existe una categoria con ese nombre', 409);
  }

  return Categoria.create({
    nombre: String(nombre).trim(),
    descripcion: descripcion ? String(descripcion).trim() : '',
    estado: estado || 'ACTIVA',
  });
}

async function actualizarCategoria(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('El id de la categoria no es valido');
  }

  const categoria = await Categoria.findById(id);

  if (!categoria) {
    throw new Error('La categoria no existe');
  }

  if (data.nombre) {
    const nombreNormalizado = String(data.nombre).trim();

    const categoriaConMismoNombre = await Categoria.findOne({
      nombre: nombreNormalizado,
      _id: { $ne: id },
    });

    if (categoriaConMismoNombre) {
      throw new Error('Ya existe una categoria con ese nombre');
    }

    categoria.nombre = nombreNormalizado;
  }

  if (data.descripcion !== undefined) {
    categoria.descripcion = String(data.descripcion || '').trim();
  }

  if (data.estado !== undefined) {
    categoria.estado = data.estado;
  }

  await categoria.save();
  return categoria;
}

async function eliminarCategoria(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('El id de la categoria no es valido');
  }

  const categoria = await Categoria.findByIdAndDelete(id);

  if (!categoria) {
    throw new Error('La categoria no existe');
  }

  return categoria;
}

module.exports = {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};