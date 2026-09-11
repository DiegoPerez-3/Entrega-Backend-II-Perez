import crypto from 'node:crypto';
import { usersRepository } from '../repositories/users.repository.js';
import { cartsRepository } from '../repositories/carts.repository.js';
import { passwordResetRepository } from '../repositories/passwordReset.repository.js';
import { mailService } from './mail.service.js';
import { config } from '../config/env.config.js';
import { createHash, isValidPassword } from '../utils/hash.js';

// Capa de Lógica de Negocio (Service) para Autenticación y Recuperación de Contraseña.
class AuthService {
  // Registro de usuario: crea usuario con rol 'user', genera su carrito y los asocia
  async registerUser({ first_name, last_name, email, age, password }) {
    if (!first_name || !last_name || !email || !age || !password) {
      throw new Error('Faltan datos obligatorios');
    }

    const exists = await usersRepository.getByEmail(email);
    if (exists) {
      const error = new Error('El usuario ya existe');
      error.statusCode = 409;
      throw error;
    }

    // 1. Crear usuario con rol 'user' por defecto y contraseña hasheada
    const user = await usersRepository.create({
      first_name,
      last_name,
      email,
      age: Number(age),
      password: createHash(password),
      role: 'user',
    });

    // 2. Crear carrito asignado al usuario
    const cart = await cartsRepository.create({
      userId: user._id,
      products: [],
    });

    // 3. Vincular el carrito al usuario
    const userWithCart = await usersRepository.updateById(user._id, { cart: cart._id });

    const userObject = userWithCart.toObject ? userWithCart.toObject() : { ...userWithCart };
    delete userObject.password;
    return userObject;
  }

  // Validación de credenciales para login (usado en estrategia Passport Local)
  async validateUserLogin(email, password) {
    if (!email || !password) {
      return null;
    }

    // Buscamos usuario trayendo explícitamente el hash de la contraseña
    const user = await usersRepository.getByEmailWithPassword(email);
    if (!user) {
      return null;
    }

    // Validamos la contraseña usando bcrypt.compareSync
    if (!isValidPassword(password, user.password)) {
      return null;
    }

    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;
    return userObject;
  }

  // Iniciar flujo de recuperación de contraseña: crea token de 1h y despacha email con botón
  async requestPasswordRecovery(email) {
    if (!email) {
      const error = new Error('El correo electrónico es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    const user = await usersRepository.getByEmail(email);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Invalidamos cualquier token previo que el usuario pudiera tener pendiente
    await passwordResetRepository.deleteByUserId(user._id);

    // Generamos token nativo UUID y fijamos expiración en 1 hora
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await passwordResetRepository.create({
      userId: user._id,
      token,
      expiresAt,
    });

    // URL hacia la vista de reseteo con el token como parámetro
    const resetUrl = `${config.APP_URL}/reset-password?token=${token}`;

    try {
      await mailService.sendPasswordResetMail(user.email, resetUrl);
    } catch (mailError) {
      console.warn('Advertencia al enviar correo de recuperación (SMTP):', mailError.message);
    }

    return {
      message: 'Correo de recuperación enviado exitosamente',
    };
  }

  // Restablecimiento efectivo de la contraseña
  async resetPassword({ token, newPassword }) {
    if (!token || !newPassword) {
      const error = new Error('Faltan datos obligatorios (token y newPassword)');
      error.statusCode = 400;
      throw error;
    }

    // 1. Buscar el token en la base de datos
    const resetRecord = await passwordResetRepository.getByToken(token);
    if (!resetRecord) {
      const error = new Error('Token de recuperación inválido o inexistente');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validación manual de expiración de 1 hora
    if (new Date() > new Date(resetRecord.expiresAt)) {
      await passwordResetRepository.deleteByToken(token);
      const error = new Error('El enlace de recuperación ha expirado. Solicite uno nuevo');
      error.statusCode = 400;
      throw error;
    }

    // 3. Obtener el usuario con su contraseña actual
    const user = await usersRepository.getByIdWithPassword(resetRecord.userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // 4. Validar que no reutilice la misma contraseña anterior usando bcrypt
    if (isValidPassword(newPassword, user.password)) {
      const error = new Error('No se puede reutilizar la misma contraseña anterior');
      error.statusCode = 400;
      throw error;
    }

    // 5. Hashear la nueva contraseña y persistirla
    const hashedPassword = createHash(newPassword);
    await usersRepository.updateById(user._id, { password: hashedPassword });

    // 6. Eliminar el token para que sea de un solo uso
    await passwordResetRepository.deleteByToken(token);

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }
}

export const authService = new AuthService();
