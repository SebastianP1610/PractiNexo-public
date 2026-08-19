const mongoose = require('mongoose');

const dependenciaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, trim: true },
    correoContacto: { type: String, trim: true, lowercase: true },
    telefonoContacto: { type: String, trim: true },
    ubicacion: { type: String, trim: true },
    estado: {
      type: String,
      enum: ['ACTIVA', 'INACTIVA'],
      default: 'ACTIVA',
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('Dependencia', dependenciaSchema);