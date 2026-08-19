const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Admin = require('../models/admin');

dotenv.config();

async function seedAdmin() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI no esta definida en variables de entorno');
  }

  const nombre = process.env.ADMIN_NOMBRE;
  const correo = process.env.ADMIN_CORREO?.toLowerCase();
  const passwordPlano = process.env.ADMIN_PASSWORD;
  const rol = process.env.ADMIN_ROL || 'SUPER_ADMIN';

  if (!nombre || !correo || !passwordPlano) {
    throw new Error('ADMIN_NOMBRE, ADMIN_CORREO y ADMIN_PASSWORD son obligatorias');
  }

  if (passwordPlano.length < 8) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 8 caracteres');
  }

  await mongoose.connect(mongoUri);

  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  const admin = await Admin.findOneAndUpdate(
    { correo },
    {
      $set: {
        nombre,
        correo,
        passwordHash,
        rol,
        estado: 'ACTIVO',
      },
      $setOnInsert: {
        fechaRegistro: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  console.log('Admin listo para pruebas de login:');
  console.log(`- id: ${admin._id.toString()}`);
  console.log(`- correo: ${admin.correo}`);
  console.log(`- rol: ${admin.rol}`);
}

seedAdmin()
  .catch((error) => {
    console.error('Error creando admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
