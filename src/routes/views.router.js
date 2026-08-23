import { Router } from 'express';
import productModel from '../models/products.model.js';
import { requireAuthView } from '../middlewares/auth.middleware.js';
import { viewController } from '../controllers/view.controller.js';
import { authTokenView } from '../utils/jsonwebtoken.js';

const router = Router();

router.get('/',authTokenView, requireAuthView, viewController.home);
router.get('/cart',authTokenView, requireAuthView, viewController.cart);
router.get('/favorites',authTokenView,requireAuthView, viewController.favorites);
router.get('/register', viewController.register);
router.get('/login', viewController.login);

export default router;
