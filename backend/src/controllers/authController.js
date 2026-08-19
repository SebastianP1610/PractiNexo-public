const { login } = require('../services/authService');

async function loginAdmin(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: 'Correo y password son obligatorios' });
    }

    const resultado = await login(correo, password);

    if (!resultado) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas' });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al iniciar sesion', error: error.message });
  }
}

function validarToken(req, res) {
  return res.status(200).json({
    mensaje: 'Token valido',
    usuario: req.usuario,
  });
}

module.exports = {
  loginAdmin,
  validarToken,
};
