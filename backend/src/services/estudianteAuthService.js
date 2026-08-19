const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Estudiante = require('../models/estudiante');
const logger = require('../utils/logger');

async function registrarEstudiante(data) {
  const {
    nombre,
    correo,
    password,
    programaAcademico,
    areaInteres,
    tipoOportunidadInteres,
    disponibilidad,
    habilidades,
    palabrasClave,
  } = data;

  if (!nombre || !correo || !password) {
    throw new Error('Nombre, correo y password son obligatorios');
  }

  const correoNormalizado = String(correo).trim().toLowerCase();

  const estudianteExistente = await Estudiante.findOne({ correo: correoNormalizado });

  if (estudianteExistente) {
    throw new Error('Ya existe un estudiante con ese correo');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const habilidadesNormalizadas = Array.isArray(habilidades)
    ? habilidades.map((h) => String(h).trim()).filter(Boolean)
    : [];

  const palabrasClaveNormalizadas = Array.isArray(palabrasClave)
    ? palabrasClave.map((p) => String(p).trim()).filter(Boolean)
    : [];

  const estudiante = await Estudiante.create({
    nombre: String(nombre).trim(),
    correo: correoNormalizado,
    passwordHash,
    programaAcademico: programaAcademico ? String(programaAcademico).trim() : '',
    areaInteres: areaInteres ? String(areaInteres).trim() : '',
    tipoOportunidadInteres: tipoOportunidadInteres || undefined,
    disponibilidad: disponibilidad ? String(disponibilidad).trim() : '',
    habilidades: habilidadesNormalizadas,
    palabrasClave: palabrasClaveNormalizadas,
  });

  return {
    estudiante: {
      id: estudiante._id,
      nombre: estudiante.nombre,
      correo: estudiante.correo,
      programaAcademico: estudiante.programaAcademico,
      areaInteres: estudiante.areaInteres,
      tipoOportunidadInteres: estudiante.tipoOportunidadInteres,
      disponibilidad: estudiante.disponibilidad,
      habilidades: estudiante.habilidades,
      palabrasClave: estudiante.palabrasClave,
      estado: estudiante.estado,
    },
  };
}

async function loginEstudiante(correo, password) {
  const estudiante = await Estudiante.findOne({
    correo: String(correo).trim().toLowerCase(),
  });

  if (!estudiante || estudiante.estado !== 'ACTIVO') {
    return null;
  }

  const passwordValido = await bcrypt.compare(password, estudiante.passwordHash);

  if (!passwordValido) {
    return null;
  }

  const token = jwt.sign(
    {
      sub: estudiante._id.toString(),
      correo: estudiante.correo,
      rol: 'ESTUDIANTE',
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
  );

  return {
    token,
    estudiante: {
      id: estudiante._id,
      nombre: estudiante.nombre,
      correo: estudiante.correo,
      programaAcademico: estudiante.programaAcademico,
      areaInteres: estudiante.areaInteres,
      tipoOportunidadInteres: estudiante.tipoOportunidadInteres,
      disponibilidad: estudiante.disponibilidad,
      habilidades: estudiante.habilidades,
      palabrasClave: estudiante.palabrasClave,
      estado: estudiante.estado,
      biografia: estudiante.biografia || '',
      telefono: estudiante.telefono || '',
      fotoPerfil: estudiante.fotoPerfil || '',
      hojaVida: estudiante.hojaVida || '',
      hojaVidaNombre: estudiante.hojaVidaNombre || '',
      redesSociales: estudiante.redesSociales || { github: '', linkedin: '', portafolio: '' },
    },
  };
}

async function solicitarRecuperacionPassword(correo) {
  if (!correo) {
    throw new Error('El correo es obligatorio');
  }

  const estudiante = await Estudiante.findOne({
    correo: String(correo).trim().toLowerCase(),
  });

  if (!estudiante || estudiante.estado !== 'ACTIVO') {
    throw new Error('No existe un estudiante activo con ese correo');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  estudiante.resetPasswordTokenHash = resetPasswordTokenHash;
  estudiante.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);

  await estudiante.save();

  if (process.env.NODE_ENV !== 'production') {
    logger.info(`[DEV] Token de recuperacion para ${correo}: ${resetToken}`);
  }

  return {
    mensaje: 'Si el correo existe, se ha enviado un enlace de recuperacion',
    expiresAt: estudiante.resetPasswordExpires,
  };
}

async function resetearPasswordConToken(token, newPassword) {
  if (!token || !newPassword) {
    throw new Error('Token y nueva password son obligatorios');
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const estudiante = await Estudiante.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!estudiante) {
    throw new Error('Token invalido o expirado');
  }

  estudiante.passwordHash = await bcrypt.hash(newPassword, 10);
  estudiante.resetPasswordTokenHash = null;
  estudiante.resetPasswordExpires = null;

  await estudiante.save();

  return {
    mensaje: 'Password actualizada correctamente',
  };
}

module.exports = {
  registrarEstudiante,
  loginEstudiante,
  solicitarRecuperacionPassword,
  resetearPasswordConToken,
};