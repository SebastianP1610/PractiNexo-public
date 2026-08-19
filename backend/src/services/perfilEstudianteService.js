const PerfilEstudiante = require('../models/perfilEstudiante');
const { crearError } = require('../utils/errors');

function validarPerfil(perfil) {
  const errores = [];

  if (!perfil.programaAcademico || !String(perfil.programaAcademico).trim()) {
    errores.push('programaAcademico es obligatorio');
  }

  if (!perfil.areaInteres || !String(perfil.areaInteres).trim()) {
    errores.push('areaInteres es obligatorio');
  }

  if (!perfil.tipoOportunidadInteres) {
    errores.push('tipoOportunidadInteres es obligatorio');
  } else if (!['PRACTICA', 'SERVICIO_SOCIAL'].includes(perfil.tipoOportunidadInteres)) {
    errores.push('tipoOportunidadInteres debe ser PRACTICA o SERVICIO_SOCIAL');
  }

  if (perfil.palabrasClave) {
    if (!Array.isArray(perfil.palabrasClave)) {
      errores.push('palabrasClave debe ser un array');
    }
  }

  return errores;
}

async function crearPerfil(perfil) {
  const errores = validarPerfil(perfil);
  if (errores.length > 0) {
    throw crearError(`Datos invalidos: ${errores.join(', ')}`, 400);
  }

  return PerfilEstudiante.create({
    programaAcademico: String(perfil.programaAcademico).trim(),
    areaInteres: String(perfil.areaInteres).trim(),
    tipoOportunidadInteres: perfil.tipoOportunidadInteres,
    disponibilidad: perfil.disponibilidad ? String(perfil.disponibilidad).trim() : '',
    palabrasClave: Array.isArray(perfil.palabrasClave)
      ? perfil.palabrasClave.map((p) => String(p).trim()).filter(Boolean)
      : [],
    fechaConsulta: new Date(),
  });
}

async function obtenerPerfilPorId(id) {
  return PerfilEstudiante.findById(id);
}

module.exports = {
  crearPerfil,
  obtenerPerfilPorId,
};
