const {
  registrarEstudiante,
  loginEstudiante,
  solicitarRecuperacionPassword,
  resetearPasswordConToken,
} = require('../services/estudianteAuthService');

async function registerEstudiante(req, res) {
  try {
    const resultado = await registrarEstudiante(req.body);

    return res.status(201).json({
      mensaje: 'Estudiante registrado correctamente',
      ...resultado,
    });
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al registrar estudiante',
      error: error.message,
    });
  }
}

async function loginEstudianteController(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'Correo y password son obligatorios',
      });
    }

    const resultado = await loginEstudiante(correo, password);

    if (!resultado) {
      return res.status(401).json({
        mensaje: 'Credenciales invalidas',
      });
    }

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al iniciar sesion de estudiante',
      error: error.message,
    });
  }
}

async function forgotPasswordEstudiante(req, res) {
  try {
    const { correo } = req.body;

    const resultado = await solicitarRecuperacionPassword(correo);

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al solicitar recuperacion de password',
      error: error.message,
    });
  }
}

async function resetPasswordEstudiante(req, res) {
  try {
    const { token, newPassword } = req.body;

    const resultado = await resetearPasswordConToken(token, newPassword);

    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al resetear password',
      error: error.message,
    });
  }
}

module.exports = {
  registerEstudiante,
  loginEstudianteController,
  forgotPasswordEstudiante,
  resetPasswordEstudiante,
};