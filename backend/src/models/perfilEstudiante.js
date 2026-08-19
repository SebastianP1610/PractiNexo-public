const mongoose = require('mongoose');

const perfilEstudianteSchema = new mongoose.Schema(
  {
    programaAcademico: { type: String, trim: true },
    areaInteres: { type: String, trim: true },
    tipoOportunidadInteres: {
      type: String,
      enum: ['PRACTICA', 'SERVICIO_SOCIAL'],
      trim: true,
    },
    disponibilidad: { type: String, trim: true },
    palabrasClave: [{ type: String, trim: true }],
    habilidades: [{ type: String, trim: true }],
    fechaConsulta: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('PerfilEstudiante', perfilEstudianteSchema);