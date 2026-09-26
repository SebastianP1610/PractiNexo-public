const { cleanEnv, str, port, num } = require('envalid');

if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGINS) {
  throw new Error('CORS_ORIGINS es obligatoria en producción');
}

if (process.env.NODE_ENV === 'production') {
  const origins = process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
  for (const origin of origins) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`CORS_ORIGINS contiene un origen invalido: ${origin}`);
    }

    const isLocal = ['localhost', '127.0.0.1'].includes(parsed.hostname);
    if (origin === '*' || (!isLocal && parsed.protocol !== 'https:') || parsed.pathname !== '/') {
      throw new Error(`CORS_ORIGINS contiene un origen inseguro: ${origin}`);
    }
  }
}

const env = cleanEnv(process.env, {
  PORT: port({ default: 4500 }),
  MONGODB_URI: str({ desc: 'URI de conexion a MongoDB' }),
  JWT_SECRET: str({ desc: 'Clave secreta para firmar JWT' }),
  JWT_EXPIRES_IN: str({ default: '24h' }),
  CORS_ORIGINS: str({ default: 'http://localhost:5173' }),
  RATE_LIMIT_WINDOW_MS: num({ default: 900000 }),
  RATE_LIMIT_MAX: num({ default: 500 }),
});

module.exports = env;
