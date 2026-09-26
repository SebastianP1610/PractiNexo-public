const mongoose = require('mongoose');

const programaAcademicoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    codigo: { type: String, trim: true, uppercase: true, default: null },
    nivelAcademico: {
      type: String,
      enum: ['TECNICA', 'TECNOLOGIA', 'PROFESIONAL'],
      default: 'PROFESIONAL',
    },
    facultad: { type: String, trim: true, default: '' },
    descripcion: { type: String, trim: true, default: '' },
    estado: {
      type: String,
      enum: ['ACTIVO', 'INACTIVO'],
      default: 'ACTIVO',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

programaAcademicoSchema.index({ codigo: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('ProgramaAcademico', programaAcademicoSchema);
