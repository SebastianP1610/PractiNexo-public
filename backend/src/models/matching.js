const mongoose = require('mongoose');

const matchingSchema = new mongoose.Schema(
  {
    perfilEstudianteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PerfilEstudiante',
      required: true,
    },
    ofertaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Oferta', required: true },
    puntajeCoincidencia: { type: Number, default: 0 },
    criteriosCoincidentes: [{ type: String }],
    fechaGeneracion: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('Matching', matchingSchema);
