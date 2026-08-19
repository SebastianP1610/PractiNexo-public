function sanitizar(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizar);
  }
  if (obj && typeof obj === 'object') {
    const limpio = {};
    for (const key of Object.keys(obj)) {
      let claveLimpia = key;
      if (claveLimpia.startsWith('$') || claveLimpia.includes('.')) {
        claveLimpia = claveLimpia.replace(/\./g, '_').replace(/^\$/, '_');
      }
      const valor = obj[key];
      if (valor === null || valor === undefined) {
        limpio[claveLimpia] = valor;
      } else if (typeof valor === 'object') {
        limpio[claveLimpia] = sanitizar(valor);
      } else {
        limpio[claveLimpia] = valor;
      }
    }
    return limpio;
  }
  return obj;
}

function mongoSanitizer(req, _res, next) {
  if (req.body) {
    const sanitizado = sanitizar(req.body);
    Object.keys(req.body).forEach((k) => delete req.body[k]);
    Object.assign(req.body, sanitizado);
  }
  next();
}

module.exports = mongoSanitizer;
