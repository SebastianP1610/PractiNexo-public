const { crearError } = require('../utils/errors');

const NIVELES_ACADEMICOS = ['TECNICA', 'TECNOLOGIA', 'PROFESIONAL'];
const ESTADOS_PROGRAMA = ['ACTIVO', 'INACTIVO'];
const NOMBRE_MIN = 5;
const NOMBRE_MAX = 120;
const CODIGO_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,19}$/;

function normalizarNombrePrograma(nombre) {
  return String(nombre || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function validarNombrePrograma(nombre) {
  const nombreNormalizado = normalizarNombrePrograma(nombre);

  if (!nombreNormalizado) {
    throw crearError('El nombre del programa es obligatorio');
  }
  if (nombreNormalizado.length < NOMBRE_MIN) {
    throw crearError(`El nombre del programa debe tener al menos ${NOMBRE_MIN} caracteres`);
  }
  if (nombreNormalizado.length > NOMBRE_MAX) {
    throw crearError(`El nombre del programa no puede superar ${NOMBRE_MAX} caracteres`);
  }

  return nombreNormalizado;
}

function validarCodigoPrograma(codigo) {
  if (codigo === undefined || codigo === null || String(codigo).trim() === '') {
    return null;
  }

  const codigoNormalizado = String(codigo).trim().toUpperCase();

  if (!CODIGO_PATTERN.test(codigoNormalizado)) {
    throw crearError('El código del programa no tiene un formato válido');
  }

  return codigoNormalizado;
}

function validarNivelAcademico(nivel) {
  if (nivel === undefined || nivel === null || String(nivel).trim() === '') {
    return 'PROFESIONAL';
  }

  const nivelNormalizado = String(nivel).trim().toUpperCase();

  if (!NIVELES_ACADEMICOS.includes(nivelNormalizado)) {
    throw crearError(
      `El nivel académico válido debe ser uno de: ${NIVELES_ACADEMICOS.join(', ')}`,
    );
  }

  return nivelNormalizado;
}

function validarEstadoPrograma(estado) {
  if (estado === undefined || estado === null || String(estado).trim() === '') {
    return 'ACTIVO';
  }

  const estadoNormalizado = String(estado).trim().toUpperCase();

  if (!ESTADOS_PROGRAMA.includes(estadoNormalizado)) {
    throw crearError(`El estado válido debe ser uno de: ${ESTADOS_PROGRAMA.join(', ')}`);
  }

  return estadoNormalizado;
}

module.exports = {
  NIVELES_ACADEMICOS,
  ESTADOS_PROGRAMA,
  normalizarNombrePrograma,
  validarNombrePrograma,
  validarCodigoPrograma,
  validarNivelAcademico,
  validarEstadoPrograma,
};
