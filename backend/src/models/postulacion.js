const mongoose = require('mongoose');

const postulacionSchema = new mongoose.Schema(
  {
    estudianteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: true,
    },
    ofertaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Oferta',
      required: true,
    },
    estado: {
      type: String,
      enum: ['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA', 'CANCELADA'],
      default: 'PENDIENTE',
    },
    observacion: { type: String, trim: true, default: '' },
    fechaPostulacion: { type: Date, default: Date.now },
    fechaCancelacion: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

postulacionSchema.index(
  { estudianteId: 1, ofertaId: 1 },
  {
    unique: true,
    partialFilterExpression: { estado: { $ne: 'CANCELADA' } },
  },
);

module.exports = mongoose.model('Postulacion', postulacionSchema);