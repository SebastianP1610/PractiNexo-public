const cache = new Map();
const MAX_ENTRIES = 100;

function obtener(clave) {
  const entry = cache.get(clave);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(clave);
    return null;
  }
  return entry.data;
}

function guardar(clave, data, ttlMs = 60000) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(clave, { data, expiresAt: Date.now() + ttlMs });
}

function invalidar(expresionStartsWith) {
  for (const clave of cache.keys()) {
    if (clave.startsWith(expresionStartsWith)) {
      cache.delete(clave);
    }
  }
}

module.exports = { obtener, guardar, invalidar };
