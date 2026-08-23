import { Router } from 'express';
import { usersController } from '../controllers/users.controller.js';
import { passportCall } from '../utils/passportCall.js';
import { authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', passportCall('current'), authorize('admin'), usersController.getUsers);
router.get('/:uid', usersController.getUserById);
router.post('/', usersController.createUser);
router.put('/:uid', usersController.updateUser);
router.delete('/:uid', passportCall('current'), authorize('admin'), usersController.deleteUser);

export default router;