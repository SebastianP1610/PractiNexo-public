const isProd = process.env.NODE_ENV === 'production';

function buildErrorResponse(mensaje, error) {
  if (isProd) {
    return { mensaje };
  }
  return { mensaje, error: error?.message || error };
}

module.exports = {
  buildErrorResponse,
};
