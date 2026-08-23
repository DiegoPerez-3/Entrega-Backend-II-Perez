import { generateToken } from '../utils/jsonwebtoken.js';

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

  const token = generateToken(userPayload);
  res.cookie('token_coder', token, { httpOnly: true });

  return res.status(200).json({
    status: 'success',
    message: 'Login exitoso',
    payload: userPayload,
  });
};

const current = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    payload: req.user,
  });
};

const logout = (req, res) => {
  res.clearCookie('token_coder');
  return res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada exitosamente',
  });
};

export const sessionsController = {
  register,
  login,
  current,
  logout,
};
