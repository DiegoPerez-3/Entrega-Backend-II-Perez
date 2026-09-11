import { passwordResetDao } from '../daos/passwordReset.dao.js';

// Patrón Repository para Recuperación de Contraseña.
// Provee los métodos de persistencia requeridos por AuthService para gestionar tokens.
class PasswordResetRepository {
  async create(data) {
    return passwordResetDao.create(data);
  }

  async getByToken(token) {
    return passwordResetDao.getByToken(token);
  }

  async deleteByToken(token) {
    return passwordResetDao.deleteByToken(token);
  }

  async deleteByUserId(userId) {
    return passwordResetDao.deleteByUserId(userId);
  }
}

export const passwordResetRepository = new PasswordResetRepository();
