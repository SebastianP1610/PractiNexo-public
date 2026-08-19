const bcrypt = require('bcryptjs');
const Estudiante = require('../models/estudiante');

function sanitizarEstudiante(estudiante) {
  if (!estudiante) return null;
  const obj = estudiante.toObject ? estudiante.toObject() : estudiante;
  delete obj.passwordHash;
  delete obj.resetPasswordTokenHash;
  delete obj.resetPasswordExpires;
  return obj;
}

async function obtenerEstudiantePorId(id) {
  const estudiante = await Estudiante.findById(id).select('-passwordHash -resetPasswordTokenHash -resetPasswordExpires');

  if (!estudiante) {
    throw new Error('El estudiante no existe');
  }

  const resultado = estudiante.toObject();
  resultado.hojaVida = resultado.hojaVida ? '/api/estudiantes/me/cv' : '';
  return resultado;
}

async function actualizarEstudiantePorId(id, data) {
  const estudiante = await Estudiante.findById(id);

  if (!estudiante) {
    throw new Error('El estudiante no existe');
  }

  if (data.nombre !== undefined) {
    estudiante.nombre = String(data.nombre || '').trim();
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

  if (data.redesSociales !== undefined) {
    const r = data.redesSociales;
    estudiante.redesSociales = {
      github: r.github ? String(r.github).trim() : '',
      linkedin: r.linkedin ? String(r.linkedin).trim() : '',
      portafolio: r.portafolio ? String(r.portafolio).trim() : '',
    };
  }

  await estudiante.save();

  const actualizado = await Estudiante.findById(id).select(
    '-passwordHash -resetPasswordTokenHash -resetPasswordExpires',
  );
  const resultado = actualizado.toObject();
  resultado.hojaVida = resultado.hojaVida ? '/api/estudiantes/me/cv' : '';
  return resultado;
}

async function cambiarPassword(id, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new Error('La contraseña actual y la nueva son obligatorias');
  }

  if (newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const estudiante = await Estudiante.findById(id);

  if (!estudiante) {
    throw new Error('El estudiante no existe');
  }

  const passwordValido = await bcrypt.compare(currentPassword, estudiante.passwordHash);

  if (!passwordValido) {
    throw new Error('La contraseña actual es incorrecta');
  }

  estudiante.passwordHash = await bcrypt.hash(newPassword, 10);
  await estudiante.save();

  return { mensaje: 'Contraseña actualizada correctamente' };
}

module.exports = {
  obtenerEstudiantePorId,
  actualizarEstudiantePorId,
  cambiarPassword,
  sanitizarEstudiante,
};
