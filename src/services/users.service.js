import { usersRepository } from '../repositories/users.repository.js';
import { cartsRepository } from '../repositories/carts.repository.js';
import { createHash } from '../utils/hash.js';

// Capa de Lógica de Negocio (Service) para el CRUD de Usuarios.
class UsersService {
  async getAllUsers() {
    return usersRepository.getAll();
  }

  async getUserById(id) {
    return usersRepository.getById(id);
  }

  async getUserByEmail(email) {
    return usersRepository.getByEmail(email);
  }

  // Crear usuario con validaciones de negocio: rol 'user' obligatorio y carrito vinculado
  async createUser(userData) {
    const { first_name, last_name, email, age, password } = userData;

    if (!first_name || !last_name || !email || !age || !password) {
      throw new Error('Faltan datos obligatorios');
    }

    const exists = await usersRepository.getByEmail(email);
    if (exists) {
      const error = new Error('El usuario ya existe');
      error.statusCode = 409;
      throw error;
    }

    // El rol público siempre es 'user'; no se permite elevar a 'admin' desde el body
    const user = await usersRepository.create({
      first_name,
      last_name,
      email,
      age: Number(age),
      password: createHash(password),
      role: 'user',
    });

    // Crear su carrito asociado
    const cart = await cartsRepository.create({
      userId: user._id,
      products: [],
    });

    const updatedUser = await usersRepository.updateById(user._id, { cart: cart._id });

    const userObj = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser };
    delete userObj.password;
    return userObj;
  }

  // Actualizar usuario: no permite modificar el rol ni el carrito asignado
  async updateUser(id, updateData) {
    const dataToUpdate = { ...updateData };
    delete dataToUpdate.role; // Protección de integridad del rol
    delete dataToUpdate.cart; // Protección: el usuario no puede reasignarse manualmente otro carrito

    if (dataToUpdate.password) {
      dataToUpdate.password = createHash(dataToUpdate.password);
    }

    if (dataToUpdate.age !== undefined) {
      dataToUpdate.age = Number(dataToUpdate.age);
    }

    const updatedUser = await usersRepository.updateById(id, dataToUpdate);
    if (!updatedUser) {
      return null;
    }

    const userObj = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser };
    delete userObj.password;
    return userObj;
  }

  // Elimina un usuario y en cascada su carrito vinculado
  async deleteUser(id) {
    const user = await usersRepository.getById(id);
    if (!user) {
      return null;
    }

    if (user.cart) {
      const cartId = user.cart._id || user.cart;
      await cartsRepository.deleteById(cartId);
    }

    return usersRepository.deleteById(id);
  }
}

export const usersService = new UsersService();
