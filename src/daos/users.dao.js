import userModel from '../models/user.model.js';

// Capa de Acceso a Datos (DAO) para Usuarios.
// Es la única capa que interactúa directamente con el modelo de Mongoose (userModel).
class UsersDao {
  // Obtener todos los usuarios con su carrito poblado
  async getAll() {
    return userModel.find().populate('cart');
  }

  // Buscar usuario por su ID
  async getById(id) {
    return userModel.findById(id).populate('cart');
  }

  // Buscar usuario por email (usado en registro y validaciones)
  async getByEmail(email) {
    return userModel.findOne({ email }).populate('cart');
  }

  // Buscar por ID incluyendo explícitamente el password (que está con select: false en el schema)
  async getByIdWithPassword(id) {
    return userModel.findById(id).select('+password');
  }

  // Buscar por email incluyendo el password para el login o validaciones de auth
  async getByEmailWithPassword(email) {
    return userModel.findOne({ email }).select('+password');
  }

  // Crear un nuevo usuario en la base de datos
  async create(data) {
    return userModel.create(data);
  }

  // Actualizar un usuario por ID devolviendo la versión actualizada
  async updateById(id, data) {
    return userModel.findByIdAndUpdate(id, data, {
      new: true,
      returnDocument: 'after',
      runValidators: true,
    }).populate('cart');
  }

  // Eliminar un usuario por su ID
  async deleteById(id) {
    return userModel.findByIdAndDelete(id);
  }
}

export const usersDao = new UsersDao();
