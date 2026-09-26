const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Estudiante = require('../models/estudiante');
const { crearError } = require('../utils/errors');
const {
  validarNombreEstudiante,
  validarCorreoEstudiante,
  validarEstadoEstudiante,
  sanitizarRespuestaAdmin,
  construirFiltrosAdmin,
} = require('./estudianteAdminValidators');

async function listarEstudiantesAdmin(filtros = {}) {
  const query = construirFiltrosAdmin(filtros);

  const page = Math.max(1, parseInt(filtros.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filtros.limit, 10) || 20));

  const total = await Estudiante.countDocuments(query);
  const data = await Estudiante.find(query)
    .select('-passwordHash -resetPasswordTokenHash -resetPasswordExpires')
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: data.map((e) => sanitizarRespuestaAdmin(e)),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

async function obtenerEstudianteAdmin(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError('El id del estudiante no es válido', 400);
  }

  const estudiante = await Estudiante.findById(id).select(
    '-passwordHash -resetPasswordTokenHash -resetPasswordExpires',
  );

  if (!estudiante) {
    throw crearError('El estudiante no existe', 404);
  }

  return sanitizarRespuestaAdmin(estudiante);
}

async function crearEstudianteAdmin(data) {
  const nombre = validarNombreEstudiante(data.nombre);
  const correo = validarCorreoEstudiante(data.correo);
  const estado = validarEstadoEstudiante(data.estado);

  if (!data.password || String(data.password).length < 6) {
    throw crearError('La contraseña debe tener al menos 6 caracteres');
  }

  const existente = await Estudiante.findOne({ correo });
  if (existente) {
    throw crearError('Ya existe un estudiante con ese correo', 409);
  }

  const passwordHash = await bcrypt.hash(String(data.password), 10);

  const estudiante = await Estudiante.create({
    nombre,
    correo,
    passwordHash,
    programaAcademico: String(data.programaAcademico || '').trim(),
    areaInteres: String(data.areaInteres || '').trim(),
    tipoOportunidadInteres: data.tipoOportunidadInteres || undefined,
    disponibilidad: String(data.disponibilidad || '').trim(),
    habilidades: Array.isArray(data.habilidades)
      ? data.habilidades.map((h) => String(h).trim()).filter(Boolean)
      : [],
    palabrasClave: Array.isArray(data.palabrasClave)
      ? data.palabrasClave.map((p) => String(p).trim()).filter(Boolean)
      : [],
    estado,
  });

  return sanitizarRespuestaAdmin(estudiante);
}

async function actualizarEstudianteAdmin(id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError('El id del estudiante no es válido', 400);
  }

  const estudiante = await Estudiante.findById(id);
  if (!estudiante) {
    throw crearError('El estudiante no existe', 404);
  }

  if (data.nombre !== undefined) {
    estudiante.nombre = validarNombreEstudiante(data.nombre);
  }

  if (data.correo !== undefined) {
    const correo = validarCorreoEstudiante(data.correo);
    const conflicto = await Estudiante.findOne({ correo, _id: { $ne: id } });
    if (conflicto) {
      throw crearError('Ya existe un estudiante con ese correo', 409);
    }
    estudiante.correo = correo;
  }

  if (data.estado !== undefined) {
    estudiante.estado = validarEstadoEstudiante(data.estado);
  }

  if (data.programaAcademico !== undefined) {
    estudiante.programaAcademico = String(data.programaAcademico || '').trim();
  }
  if (data.areaInteres !== undefined) {
    estudiante.areaInteres = String(data.areaInteres || '').trim();
  }
  if (data.tipoOportunidadInteres !== undefined) {
    estudiante.tipoOportunidadInteres = data.tipoOportunidadInteres || undefined;
  }
  if (data.disponibilidad !== undefined) {
    estudiante.disponibilidad = String(data.disponibilidad || '').trim();
  }
  if (data.habilidades !== undefined) {
    estudiante.habilidades = Array.isArray(data.habilidades)
      ? data.habilidades.map((h) => String(h).trim()).filter(Boolean)
      : [];
  }
  if (data.palabrasClave !== undefined) {
    estudiante.palabrasClave = Array.isArray(data.palabrasClave)
      ? data.palabrasClave.map((p) => String(p).trim()).filter(Boolean)
      : [];
  }
  if (data.biografia !== undefined) {
    estudiante.biografia = String(data.biografia || '').trim().slice(0, 500);
  }
  if (data.telefono !== undefined) {
    estudiante.telefono = String(data.telefono || '').trim();
  }

  if (data.password) {
    if (String(data.password).length < 6) {
      throw crearError('La contraseña debe tener al menos 6 caracteres');
    }
    estudiante.passwordHash = await bcrypt.hash(String(data.password), 10);
  }

  await estudiante.save();

  const actualizado = await Estudiante.findById(id).select(
    '-passwordHash -resetPasswordTokenHash -resetPasswordExpires',
  );
  return sanitizarRespuestaAdmin(actualizado);
}

async function eliminarEstudianteAdmin(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw crearError('El id del estudiante no es válido', 400);
  }

  const estudiante = await Estudiante.findByIdAndDelete(id).select(
    '-passwordHash -resetPasswordTokenHash -resetPasswordExpires',
  );

  if (!estudiante) {
    throw crearError('El estudiante no existe', 404);
  }

  return sanitizarRespuestaAdmin(estudiante);
}

module.exports = {
  listarEstudiantesAdmin,
  obtenerEstudianteAdmin,
  crearEstudianteAdmin,
  actualizarEstudianteAdmin,
  eliminarEstudianteAdmin,
};
