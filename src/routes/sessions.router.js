import { Router } from 'express';
import { sessionsController } from '../controllers/sessions.controller.js';
import { passportCall } from '../utils/passportCall.js';

const router = Router();

// Registro de usuario
router.post('/register', passportCall('register'), sessionsController.register);

// Login con emisión de cookie JWT (token_coder)
router.post('/login', passportCall('login'), sessionsController.login);

// Retorna los datos del usuario autenticado normalizados con DTO
router.get('/current', passportCall('current'), sessionsController.current);

// Cierre de sesión y limpieza de cookie
router.get('/logout', sessionsController.logout);

// Solicitar envío de correo para recuperación de contraseña
router.post('/password-recovery', sessionsController.passwordRecovery);

// Restablecer contraseña verificando token y que no sea igual a la anterior
router.post('/reset-password', sessionsController.resetPassword);

export default router;
