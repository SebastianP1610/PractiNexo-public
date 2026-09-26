const { crearError } = require('../utils/errors');

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 100;
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ESTADOS_ESTUDIANTE = ['ACTIVO', 'INACTIVO'];

function normalizarEspacios(texto) {
  return String(texto || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function validarNombreEstudiante(nombre) {
  const normalizado = normalizarEspacios(nombre);

  if (!normalizado) {
    throw crearError('El nombre del estudiante es obligatorio');
  }
  if (normalizado.length < NOMBRE_MIN) {
    throw crearError(`El nombre del estudiante debe tener al menos ${NOMBRE_MIN} caracteres`);
  }
  if (normalizado.length > NOMBRE_MAX) {
    throw crearError(`El nombre del estudiante no puede superar ${NOMBRE_MAX} caracteres`);
  }

  return normalizado;
}

function validarCorreoEstudiante(correo) {
  const normalizado = String(correo || '').trim().toLowerCase();

  if (!normalizado) {
    throw crearError('El correo electrónico es obligatorio');
  }
  if (!CORREO_REGEX.test(normalizado)) {
    throw crearError('Se requiere un correo electrónico válido (ej: usuario@dominio.com)');
  }

  return normalizado;
}

function validarEstadoEstudiante(estado) {
  if (estado === undefined || estado === null || String(estado).trim() === '') {
    return 'ACTIVO';
  }

  const normalizado = String(estado).trim().toUpperCase();

  if (!ESTADOS_ESTUDIANTE.includes(normalizado)) {
    throw crearError(`El estado válido debe ser uno de: ${ESTADOS_ESTUDIANTE.join(', ')}`);
  }

  return normalizado;
}

function sanitizarRespuestaAdmin(estudiante) {
  if (!estudiante) return null;

  const obj = typeof estudiante.toObject === 'function'
    ? estudiante.toObject()
    : { ...estudiante };

  delete obj.passwordHash;
  delete obj.resetPasswordTokenHash;
  delete obj.resetPasswordExpires;

  return obj;
}

function construirFiltrosAdmin(filtros = {}) {
  const query = {};

  if (filtros.estado && String(filtros.estado).trim()) {
    query.estado = validarEstadoEstudiante(filtros.estado);
  }

  if (filtros.programa && String(filtros.programa).trim()) {
    const escaped = String(filtros.programa).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.programaAcademico = new RegExp(escaped, 'i');
  }

  if (filtros.busqueda && String(filtros.busqueda).trim()) {
    const escaped = String(filtros.busqueda).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(escaped, 'i');
    query.$or = [{ nombre: rx }, { correo: rx }];
  }

  return query;
}

module.exports = {
  ESTADOS_ESTUDIANTE,
  validarNombreEstudiante,
  validarCorreoEstudiante,
  validarEstadoEstudiante,
  sanitizarRespuestaAdmin,
  construirFiltrosAdmin,
};
