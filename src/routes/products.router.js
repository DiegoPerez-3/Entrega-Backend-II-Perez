import { Router } from 'express';
import { productController } from '../controllers/products.controller.js';
import { passportCall } from '../utils/passportCall.js';
import { authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas de lectura de productos (públicas para visitantes del catálogo)
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Rutas CUD protegidas exclusivamente para rol 'admin' mediante passportCall('current')
router.post('/', passportCall('current'), authorize('admin'), productController.createProduct);
router.patch('/:id', passportCall('current'), authorize('admin'), productController.updateProduct);
router.delete('/:id', passportCall('current'), authorize('admin'), productController.deleteProduct);

export default router;
