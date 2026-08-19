const mongoose = require('mongoose');

const ofertaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    tipoOportunidad: {
      type: String,
      enum: ['PRACTICA', 'SERVICIO_SOCIAL'],
      required: true,
    },
    requisitos: [{ type: String, trim: true }],
    fechaPublicacion: { type: Date, default: Date.now },
    fechaCierre: { type: Date },
    estadoVigencia: {
      type: String,
      enum: ['ACTIVA', 'INACTIVA', 'CERRADA', 'VENCIDA'],
      default: 'ACTIVA',
    },
    contacto: { type: String, required: true, trim: true },
    programaAcademico: { type: String, trim: true },
    areaInteres: { type: String, trim: true },
    disponibilidad: { type: String, trim: true },
    palabrasClave: [{ type: String, trim: true }],
    dependenciaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dependencia',
      required: true,
    },
    categoriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: true,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('Oferta', ofertaSchema);