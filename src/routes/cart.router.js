import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { passportCall } from '../utils/passportCall.js';
import { authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Vista del carrito (render Handlebars)
router.get('/', async (req, res) => {
  res.render('cart');
});

// Agregar producto o incrementar cantidad en el carrito (exclusivo para usuarios autenticados con rol 'user')
router.post(
  '/:cid/product/:pid',
  passportCall('current'),
  authorize('user'),
  cartController.addProduct
);

// Finalizar compra del carrito y generar Ticket (exclusivo para rol 'user')
router.post(
  '/:cid/purchase',
  passportCall('current'),
  authorize('user'),
  cartController.purchase
);

export default router;