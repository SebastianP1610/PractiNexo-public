function etiquetaCriterio(c) {
  const map = {
    programaAcademico: "Programa",
    areaInteres: "Área de interés",
    tipoOportunidad: "Tipo de oportunidad",
    disponibilidad: "Disponibilidad",
    palabrasClave: "Skills y keywords",
    requisitos: "Requisitos",
  };
  return map[c] || c;
}

function calcularPorcentaje(puntaje) {
  return Math.min(100, Math.round(Number(puntaje) || 0));
}

export { etiquetaCriterio, calcularPorcentaje };
