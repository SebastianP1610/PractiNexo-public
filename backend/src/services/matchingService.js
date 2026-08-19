const Oferta = require('../models/oferta');
const Estudiante = require('../models/estudiante');
const Matching = require('../models/matching');
const PerfilEstudiante = require('../models/perfilEstudiante');
const {
  evaluarCoincidencia,
} = require('./matchingEngine');
const logger = require('../utils/logger');

async function obtenerOfertasNoVencidas() {
  return Oferta.find({ estadoVigencia: 'ACTIVA' });
}

async function generarSugerencias(perfil) {
  const ofertasNoVencidas = await obtenerOfertasNoVencidas();

  const sugerencias = ofertasNoVencidas
    .map((oferta) => {
      const resultado = evaluarCoincidencia(perfil, oferta);
      return {
        oferta,
        ...resultado,
      };
    })
    .filter((item) => item.puntajeCoincidencia > 0)
    .sort((a, b) => b.puntajeCoincidencia - a.puntajeCoincidencia);

  if (sugerencias.length > 0) {
    try {
      const perfilGuardado = await PerfilEstudiante.create({
        programaAcademico: perfil.programaAcademico,
        areaInteres: perfil.areaInteres,
        tipoOportunidadInteres: perfil.tipoOportunidadInteres,
        disponibilidad: perfil.disponibilidad,
        palabrasClave: perfil.palabrasClave,
        habilidades: perfil.habilidades,
        fechaConsulta: new Date(),
      });

      const matchings = sugerencias.map((s) => ({
        perfilEstudianteId: perfilGuardado._id,
        ofertaId: s.oferta._id,
        puntajeCoincidencia: s.puntajeCoincidencia,
        criteriosCoincidentes: s.criteriosCoincidentes,
        fechaGeneracion: new Date(),
      }));

      await Matching.insertMany(matchings);
    } catch (err) {
      logger.error(`[MatchingService] Error al persistir matching: ${err.message}`);
    }
  }

  return sugerencias;
}

async function generarSugerenciasParaEstudiante(estudianteId) {
  const estudiante = await Estudiante.findById(estudianteId);

  if (!estudiante) {
    throw new Error('El estudiante no existe');
  }

  const perfil = {
    programaAcademico: estudiante.programaAcademico,
    areaInteres: estudiante.areaInteres,
    tipoOportunidadInteres: estudiante.tipoOportunidadInteres,
    disponibilidad: estudiante.disponibilidad,
    palabrasClave: estudiante.palabrasClave,
    habilidades: estudiante.habilidades,
  };

  return generarSugerencias(perfil);
}

module.exports = {
  generarSugerencias,
  generarSugerenciasParaEstudiante,
};
