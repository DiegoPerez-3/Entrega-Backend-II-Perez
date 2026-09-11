import { usersService } from '../services/users.service.js';

// Controlador para Usuarios.
// Conecta las rutas de /api/users con usersService.
const getUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers();
    res.status(200).json({ status: 'success', payload: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await usersService.getUserById(uid);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }
    res.status(200).json({ status: 'success', payload: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ status: 'error', message: 'Body vacío o mal formado' });
    }

    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ status: 'error', message: 'Faltan datos obligatorios' });
    }

    const newUser = await usersService.createUser({ first_name, last_name, email, age, password });
    res.status(201).json({ status: 'success', payload: newUser });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ status: 'error', message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!req.body) {
      return res.status(400).json({ status: 'error', message: 'Body vacío o mal formado' });
    }

    const updatedUser = await usersService.updateUser(uid, req.body);
    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    res.status(200).json({ status: 'success', payload: updatedUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const deleted = await usersService.deleteUser(uid);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Usuario eliminado exitosamente',
      payload: deleted,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const usersController = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};