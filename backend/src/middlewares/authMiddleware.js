const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const Estudiante = require('../models/estudiante');

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const token = authorization.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (payload.rol === 'ESTUDIANTE') {
      const estudiante = await Estudiante.findById(payload.sub).select('_id correo estado');

      if (!estudiante || estudiante.estado !== 'ACTIVO') {
        return res.status(401).json({ mensaje: 'Sesion no valida para este usuario' });
      }

      req.usuario = {
        sub: estudiante._id.toString(),
        correo: estudiante.correo,
        rol: 'ESTUDIANTE',
      };

      return next();
    }

    const admin = await Admin.findById(payload.sub).select('_id correo rol estado');

    if (!admin || admin.estado !== 'ACTIVO') {
      return res.status(401).json({ mensaje: 'Sesion no valida para este usuario' });
    }

    req.usuario = {
      sub: admin._id.toString(),
      correo: admin.correo,
      rol: admin.rol,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta accion' });
    }

    return next();
  };
}

module.exports = { authMiddleware, requireRole };
