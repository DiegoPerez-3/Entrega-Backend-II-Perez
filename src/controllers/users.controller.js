import userModel from '../models/user.model.js';
import cartModel from '../models/cart.model.js';
import { createHash } from '../utils/hash.js';

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find().populate('cart');
    res.status(200).json({ status: 'success', payload: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await userModel.findById(uid).populate('cart');
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

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({ status: 'error', message: 'El usuario ya existe' });
    }

    const user = await userModel.create({
      first_name,
      last_name,
      email,
      age: Number(age),
      password: createHash(password),
    });

    const cart = await cartModel.create({
      userId: user._id,
      products: [],
    });

    user.cart = cart._id;
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({ status: 'success', payload: userObject });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!req.body) {
      return res.status(400).json({ status: 'error', message: 'Body vacío o mal formado' });
    }

    const updateData = { ...req.body };
    delete updateData.role;

    if (updateData.password) {
      updateData.password = createHash(updateData.password);
    }

    if (updateData.age) {
      updateData.age = Number(updateData.age);
    }

    const updatedUser = await userModel.findByIdAndUpdate(uid, updateData, {
      new: true,
      runValidators: true,
    }).populate('cart');

    if (!updatedUser) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    const userObject = updatedUser.toObject();
    delete userObject.password;

    res.status(200).json({ status: 'success', payload: userObject });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await userModel.findById(uid);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    if (user.cart) {
      await cartModel.findByIdAndDelete(user.cart);
    }

    const deletedUser = await userModel.findByIdAndDelete(uid);

    res.status(200).json({
      status: 'success',
      message: 'Usuario eliminado exitosamente',
      payload: deletedUser,
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