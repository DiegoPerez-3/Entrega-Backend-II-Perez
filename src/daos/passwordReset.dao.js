import passwordResetModel from '../models/passwordReset.model.js';

// Capa de Acceso a Datos (DAO) para PasswordReset.
// Gestiona el almacenamiento y ciclo de vida de los tokens de recuperación de contraseña.
class PasswordResetDao {
  // Guarda un nuevo token asociado a un usuario con su fecha de expiración
  async create(data) {
    return passwordResetModel.create(data);
  }

  // Busca el documento de reseteo mediante el token UUID
  async getByToken(token) {
    return passwordResetModel.findOne({ token });
  }

  // Elimina un token una vez utilizado (garantiza token de un solo uso)
  async deleteByToken(token) {
    return passwordResetModel.deleteOne({ token });
  }

  // Invalida tokens previos emitidos para un mismo usuario al solicitar uno nuevo
  async deleteByUserId(userId) {
    return passwordResetModel.deleteMany({ userId });
  }
}

export const passwordResetDao = new PasswordResetDao();
