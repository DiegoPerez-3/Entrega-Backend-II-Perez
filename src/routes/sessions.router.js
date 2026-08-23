import { Router } from 'express';
import { sessionsController } from '../controllers/sessions.controller.js';
import { passportCall } from '../utils/passportCall.js';

const router = Router();

router.post('/register', passportCall('register'), sessionsController.register);
router.post('/login', passportCall('login'), sessionsController.login);
router.get('/current', passportCall('current'), sessionsController.current);
router.get('/logout', sessionsController.logout);

export default router;
