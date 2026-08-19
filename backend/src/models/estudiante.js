const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    programaAcademico: { type: String, trim: true },
    areaInteres: { type: String, trim: true },
    tipoOportunidadInteres: {
      type: String,
      enum: ['PRACTICA', 'SERVICIO_SOCIAL'],
      trim: true,
    },
    disponibilidad: { type: String, trim: true },
    habilidades: [{ type: String, trim: true }],
    palabrasClave: [{ type: String, trim: true }],
    estado: { type: String, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' },
    fechaRegistro: { type: Date, default: Date.now },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    biografia: { type: String, trim: true, maxlength: 500, default: '' },
    telefono: { type: String, trim: true, default: '' },
    fotoPerfil: { type: String, default: '' },
    hojaVida: { type: String, default: '' },
    hojaVidaNombre: { type: String, default: '' },
    redesSociales: {
      github: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      portafolio: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('Estudiante', estudianteSchema);