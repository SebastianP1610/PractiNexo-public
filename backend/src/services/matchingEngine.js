const STOP_WORDS = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'del', 'para', 'por', 'con',
  'las', 'los', 'un', 'una', 'que', 'es', 'se', 'no', 'su', 'lo',
  'como', 'mas', 'pero', 'sus', 'le', 'ya', 'este', 'entre', 'porque',
  'al', 'cual', 'cuando', 'donde', 'todo', 'tambien', 'era', 'muy',
  'sin', 'sobre', 'tras', 'durante', 'contra', 'mediante', 'segun',
  'hacia', 'hasta', 'ese', 'esa', 'eso', 'cada', 'otro', 'ni',
]);

function sinAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizarTexto(valor) {
  return sinAcentos(String(valor || '').trim().toLowerCase());
}

function tokenizar(texto) {
  return normalizarTexto(texto)
    .split(/[\s,;.-]+/)
    .filter(Boolean)
    .filter((p) => !STOP_WORDS.has(p));
}

function keywordsCoinciden(a, b) {
  if (a === b) return true;
  if (a.length >= 3 && b.length >= 3) {
    if (a.includes(b) || b.includes(a)) return true;
  }
  return false;
}

function calcularCoincidenciaTexto(valorPerfil, valorOferta) {
  const a = normalizarTexto(valorPerfil);
  const b = normalizarTexto(valorOferta);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const palabrasA = tokenizar(a);
  const palabrasB = tokenizar(b);

  if (palabrasA.length === 0 || palabrasB.length === 0) return 0;

  const setA = new Set(palabrasA);
  const setB = new Set(palabrasB);

  let interseccion = 0;
  for (const palabra of setA) {
    if (setB.has(palabra)) interseccion++;
  }

  const union = new Set([...setA, ...setB]).size;
  return interseccion / union;
}

function calcularCoincidenciaKeywords(palabrasPerfil, palabrasReferencia) {
  const perfil = [...new Set(
    (palabrasPerfil || []).map(normalizarTexto).filter(Boolean),
  )];
  const referencia = [...new Set(
    (palabrasReferencia || []).map(normalizarTexto).filter(Boolean),
  )];

  if (perfil.length === 0 || referencia.length === 0) return 0;

  const comunes = perfil.filter((p) => referencia.some((r) => keywordsCoinciden(p, r)));
  const denom = Math.min(perfil.length, referencia.length);
  return Math.min(1, comunes.length / denom);
}

function calcularInterseccion(palabrasPerfil, palabrasReferencia) {
  const perfil = [...new Set(
    (palabrasPerfil || []).map(normalizarTexto).filter(Boolean),
  )];
  const referencia = [...new Set(
    (palabrasReferencia || []).map(normalizarTexto).filter(Boolean),
  )];
  return perfil.filter((p) => referencia.some((r) => keywordsCoinciden(p, r)));
}

function evaluarCoincidencia(perfil, oferta) {
  const criterios = [];
  const detalles = {};

  const progCoincidencia = calcularCoincidenciaTexto(
    perfil.programaAcademico,
    oferta.programaAcademico,
  );
  const progPuntaje = Math.round(25 * progCoincidencia);
  let puntaje = progPuntaje;
  if (progCoincidencia > 0) {
    criterios.push('programaAcademico');
    const palabrasPerfil = tokenizar(perfil.programaAcademico);
    const palabrasOferta = tokenizar(oferta.programaAcademico);
    detalles.programaAcademico = {
      puntaje: progPuntaje,
      peso: 25,
      palabrasPerfil,
      palabrasOferta,
      coinciden: calcularInterseccion(palabrasPerfil, palabrasOferta),
    };
  }

  const areaCoincidencia = calcularCoincidenciaTexto(
    perfil.areaInteres,
    oferta.areaInteres,
  );
  const areaPuntaje = Math.round(25 * areaCoincidencia);
  puntaje += areaPuntaje;
  if (areaCoincidencia > 0) {
    criterios.push('areaInteres');
    const palabrasPerfil = tokenizar(perfil.areaInteres);
    const palabrasOferta = tokenizar(oferta.areaInteres);
    detalles.areaInteres = {
      puntaje: areaPuntaje,
      peso: 25,
      palabrasPerfil,
      palabrasOferta,
      coinciden: calcularInterseccion(palabrasPerfil, palabrasOferta),
    };
  }

  const tipoPerfil = normalizarTexto(perfil.tipoOportunidadInteres);
  const tipoOferta = normalizarTexto(oferta.tipoOportunidad);
  if (tipoPerfil && tipoOferta && tipoPerfil === tipoOferta) {
    puntaje += 20;
    criterios.push('tipoOportunidad');
    detalles.tipoOportunidad = { puntaje: 20, valor: tipoPerfil };
  }

  if (
    perfil.disponibilidad &&
    oferta.disponibilidad &&
    normalizarTexto(perfil.disponibilidad) === normalizarTexto(oferta.disponibilidad)
  ) {
    puntaje += 5;
    criterios.push('disponibilidad');
    detalles.disponibilidad = {
      puntaje: 5,
      valor: normalizarTexto(perfil.disponibilidad),
    };
  }

  const keywords = [...(perfil.palabrasClave || []), ...(perfil.habilidades || [])];
  const palabrasClaveUnificadas = keywords.length
    ? keywords.map((s) => String(s).trim()).filter(Boolean)
    : (perfil.palabrasClave || []);

  const kwOfertaCoincidencia = calcularCoincidenciaKeywords(
    palabrasClaveUnificadas,
    oferta.palabrasClave,
  );
  const kwPuntaje = Math.round(15 * kwOfertaCoincidencia);
  puntaje += kwPuntaje;
  if (kwOfertaCoincidencia > 0) {
    criterios.push('palabrasClave');
    detalles.palabrasClave = {
      puntaje: kwPuntaje,
      peso: 15,
      palabrasPerfil: palabrasClaveUnificadas.map(normalizarTexto).filter(Boolean),
      palabrasOferta: (oferta.palabrasClave || []).map(normalizarTexto).filter(Boolean),
      coinciden: calcularInterseccion(palabrasClaveUnificadas, oferta.palabrasClave),
    };
  }

  const kwRequisitosCoincidencia = calcularCoincidenciaKeywords(
    palabrasClaveUnificadas,
    oferta.requisitos,
  );
  const kwReqPuntaje = Math.round(10 * kwRequisitosCoincidencia);
  puntaje += kwReqPuntaje;
  if (kwRequisitosCoincidencia > 0) {
    criterios.push('requisitos');
    detalles.requisitos = {
      puntaje: kwReqPuntaje,
      peso: 10,
      palabrasPerfil: palabrasClaveUnificadas.map(normalizarTexto).filter(Boolean),
      palabrasReferencia: (oferta.requisitos || []).map(normalizarTexto).filter(Boolean),
      coinciden: calcularInterseccion(palabrasClaveUnificadas, oferta.requisitos),
    };
  }

  return {
    puntajeCoincidencia: Math.min(100, puntaje),
    criteriosCoincidentes: criterios,
    detalles,
  };
}

module.exports = {
  normalizarTexto,
  tokenizar,
  sinAcentos,
  keywordsCoinciden,
  calcularCoincidenciaTexto,
  calcularCoincidenciaKeywords,
  calcularInterseccion,
  evaluarCoincidencia,
};
