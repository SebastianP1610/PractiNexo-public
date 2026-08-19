const { crearError } = require('../utils/errors');

function validarTitulo(titulo) {
  const tituloTrim = (titulo || "").trim();
  if (tituloTrim.length < 5) {
    throw crearError('El titulo debe tener al menos 5 caracteres');
  }
  return tituloTrim;
}

function validarDescripcion(descripcion) {
  const descripcionTrim = (descripcion || "").trim();
  if (descripcionTrim.length < 20) {
    throw crearError('La descripcion debe tener al menos 20 caracteres');
  }
  return descripcionTrim;
}

function validarTipoOportunidad(tipo) {
  if (tipo !== undefined && !["PRACTICA", "SERVICIO_SOCIAL"].includes(tipo)) {
    throw crearError('tipoOportunidad debe ser PRACTICA o SERVICIO_SOCIAL');
  }
  return tipo;
}

function validarContacto(contacto) {
  const contactoTrim = String(contacto || "").trim();
  const esEmail = contactoTrim.includes("@");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;

  if (esEmail && !emailRegex.test(contactoTrim)) {
    throw crearError('El correo de contacto no tiene un formato valido');
  }
  if (!esEmail && !phoneRegex.test(contactoTrim)) {
    throw crearError('El telefono de contacto no tiene un formato valido');
  }
  return contactoTrim;
}

function validarFechaCierre(fecha) {
  if (fecha) {
    const fechaCierreDate = new Date(fecha);
    if (Number.isNaN(fechaCierreDate.getTime())) {
      throw crearError('La fecha de cierre no es una fecha valida');
    }
    const ahora = new Date();
    if (fechaCierreDate < ahora) {
      throw crearError('La fecha de cierre no puede ser anterior a la fecha actual');
    }
  }
  return fecha || null;
}

function validarEstadoVigencia(estado) {
  if (estado !== undefined && !["ACTIVA", "INACTIVA", "CERRADA", "VENCIDA"].includes(estado)) {
    throw crearError('estadoVigencia debe ser ACTIVA, INACTIVA, CERRADA o VENCIDA');
  }
  return estado;
}

function normalizarTextoOferta(texto) {
  return texto !== undefined ? String(texto || "").trim() : undefined;
}

function normalizarRequisitos(requisitos) {
  if (!Array.isArray(requisitos)) return [];
  return requisitos.map((r) => String(r).trim()).filter(Boolean);
}

function normalizarPalabrasClave(palabras) {
  if (!Array.isArray(palabras)) return [];
  return palabras.map((p) => String(p).trim()).filter(Boolean);
}

module.exports = {
  validarTitulo,
  validarDescripcion,
  validarTipoOportunidad,
  validarContacto,
  validarFechaCierre,
  validarEstadoVigencia,
  normalizarTextoOferta,
  normalizarRequisitos,
  normalizarPalabrasClave,
};
