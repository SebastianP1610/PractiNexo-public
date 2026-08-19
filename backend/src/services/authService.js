const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

async function login(correo, password) {
  const admin = await Admin.findOne({ correo: String(correo).toLowerCase() });

  if (!admin || admin.estado !== 'ACTIVO') {
    return null;
  }

  const passwordValido = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordValido) {
    return null;
  }

  const token = jwt.sign(
    {
      sub: admin._id.toString(),
      correo: admin.correo,
      rol: admin.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
  );

  return {
    token,
    admin: {
      id: admin._id,
      nombre: admin.nombre,
      correo: admin.correo,
      rol: admin.rol,
    },
  };
}

module.exports = {
  login,
};
