const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const env = require('./utils/env');
const { globalLimiter, authLimiter, registerLimiter } = require('./middlewares/rateLimiter');
const mongoSanitizer = require('./middlewares/mongoSanitizer');

const authRoutes = require('./routes/authRoutes');
const ofertaRoutes = require('./routes/ofertaRoutes');
const dependenciaRoutes = require('./routes/dependenciaRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const estudianteAuthRoutes = require('./routes/estudianteAuthRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes');
const postulacionRoutes = require('./routes/postulacionRoutes');

const app = express();
const PORT = env.PORT;

const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');

const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
  }),
);
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
    ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "blob:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
        },
      }
    : false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitizer);
app.use(globalLimiter);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
app.use('/uploads/fotos', express.static(path.join(UPLOADS_DIR, 'fotos')));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    mensaje: 'API de PractiNexo operativa',
    db: mongoose.connection.readyState === 1 ? 'conectada' : 'desconectada',
  });
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/ofertas', ofertaRoutes);
app.use('/api/dependencias', dependenciaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/estudiantes-auth/login', authLimiter);
app.use('/api/estudiantes-auth/forgot-password', authLimiter);
app.use('/api/estudiantes-auth/reset-password', authLimiter);
app.use('/api/estudiantes-auth/register', registerLimiter);
app.use('/api/estudiantes-auth', estudianteAuthRoutes);
app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/postulaciones', postulacionRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ mensaje: 'Ruta de API no encontrada' });
});

const logger = require('./utils/logger');
if (fs.existsSync(path.join(FRONTEND_DIST, 'index.html'))) {
  app.use(express.static(FRONTEND_DIST));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else {
  app.use((_req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
  });
}

app.use((err, _req, res, _next) => {
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ mensaje: 'Origen no permitido' });
  }
  logger.error(`Error no manejado: ${err.message}`);
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(err.statusCode || 500).json({
    mensaje: isProd ? 'Error interno del servidor' : (err.message || 'Error interno del servidor'),
  });
});

async function iniciarServidor() {
  const mongoUri = env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      logger.info('MongoDB conectado');
      await migrarIndicesPostulacion();
    } catch (error) {
      logger.error(`No se pudo conectar a MongoDB: ${error.message}`);
    }
  }

  app.listen(PORT, () => {
    logger.info(`Servidor backend en http://localhost:${PORT}`);
  });
}

/**
 * Reemplaza el indice unique { estudianteId, ofertaId } por uno parcial que
 * excluye postulaciones en estado CANCELADA. Asi, un estudiante puede
 * volver a postularse a una oferta que habia cancelado.
 */
async function migrarIndicesPostulacion() {
  const coll = mongoose.connection.collection('postulacions');
  if (!coll) return;
  try {
    const indices = await coll.indexes();
    const viejo = indices.find(
      (i) =>
        i.key &&
        i.key.estudianteId === 1 &&
        i.key.ofertaId === 1 &&
        i.unique === true &&
        !i.partialFilterExpression,
    );
    if (viejo) {
      await coll.dropIndex(viejo.name);
      logger.info(`Indice viejo '${viejo.name}' eliminado.`);
    }
    await mongoose.model('Postulacion').syncIndexes();
    logger.info('Indices de Postulacion sincronizados.');
  } catch (error) {
    logger.warn(`No se pudo migrar indices de postulacion: ${error.message}`);
  }
}

iniciarServidor();

module.exports = app;
