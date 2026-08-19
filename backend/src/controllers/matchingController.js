const { generarSugerencias } = require('../services/matchingService');

async function sugerenciasMatching(req, res) {
  try {
    const perfil = req.body;
    const sugerencias = await generarSugerencias(perfil);

    if (!sugerencias.length) {
      return res.status(200).json({ mensaje: 'Sin sugerencias disponibles', data: [] });
    }

    return res.status(200).json({
      mensaje: 'Sugerencias generadas correctamente',
      data: sugerencias,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: 'Error al generar sugerencias', error: error.message });
  }
}

module.exports = {
  sugerenciasMatching,
};
