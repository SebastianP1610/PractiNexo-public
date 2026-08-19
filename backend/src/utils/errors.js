function crearError(mensaje, statusCode = 400) {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
}

function getStatusCode(error) {
  if (error?.statusCode) {
    return error.statusCode;
  }

  if (error?.code === 11000) {
    return 409;
  }

  return 500;
}

module.exports = {
  crearError,
  getStatusCode,
};
