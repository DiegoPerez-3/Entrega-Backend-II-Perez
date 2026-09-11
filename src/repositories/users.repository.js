import { usersDao } from '../daos/users.dao.js';

// Patrón Repository para Usuarios.
// Abstrae la persistencia de datos consumiendo el DAO correspondiente.
// Los Services interactúan con esta capa sin acoplarse directamente a Mongoose.
class UsersRepository {
  async getAll() {
    return usersDao.getAll();
  }

  async getById(id) {
    return usersDao.getById(id);
  }

  async getByEmail(email) {
    return usersDao.getByEmail(email);
  }

  async getByIdWithPassword(id) {
    return usersDao.getByIdWithPassword(id);
  }

  async getByEmailWithPassword(email) {
    return usersDao.getByEmailWithPassword(email);
  }

  async create(data) {
    return usersDao.create(data);
  }

  async updateById(id, data) {
    return usersDao.updateById(id, data);
  }

  async deleteById(id) {
    return usersDao.deleteById(id);
  }
}

export const usersRepository = new UsersRepository();
