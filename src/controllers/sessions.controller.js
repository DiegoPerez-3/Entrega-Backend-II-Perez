import { generateToken } from '../utils/jsonwebtoken.js';
import { userDto } from '../dtos/user.dto.js';
import { authService } from '../services/auth.service.js';

// Controlador para Autenticación y Manejo de Sesiones.
const register = async (req, res) => {
  return res.status(201).json({
    status: 'success',
    message: 'Usuario registrado exitosamente',
    payload: req.user,
  });
};

const login = async (req, res) => {
  const userPayload = {
    _id: req.user._id,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    email: req.user.email,
    age: req.user.age,
    cart: req.user.cart,
    role: req.user.role,
  };

  // Firmamos el JWT y lo enviamos en cookie HttpOnly segura
  const token = generateToken(userPayload);
  res.cookie('token_coder', token, { httpOnly: true });

  return res.status(200).json({
    status: 'success',
    message: 'Login exitoso',
    payload: userPayload,
  });
};

// Endpoint /current: procesa req.user a través del DTO obligatorio para ocultar datos sensibles
const current = async (req, res) => {
  const safeUser = userDto.toCurrent(req.user);
  return res.status(200).json({
    status: 'success',
    payload: safeUser,
  });
};

const logout = (req, res) => {
  res.clearCookie('token_coder');
  return res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada exitosamente',
  });
};

// Solicitud de correo de recuperación de contraseña (enlace válido por 1 hora con botón)
const passwordRecovery = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico es requerido',
      });
    }

    const result = await authService.requestPasswordRecovery(email);
    return res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Reseteo efectivo de contraseña con validación de contraseña repetida y expiración
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos obligatorios (token y newPassword)',
      });
    }

    const result = await authService.resetPassword({ token, newPassword });
    return res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const sessionsController = {
  register,
  login,
  current,
  logout,
  passwordRecovery,
  resetPassword,
};
