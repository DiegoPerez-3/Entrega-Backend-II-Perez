import { Router } from 'express';
import { productController } from '../controllers/products.controller.js';
import { authorize } from '../middlewares/auth.middleware.js';
import { authToken } from '../utils/jsonwebtoken.js';

const router = Router();

router.get('/',authToken, productController.getProducts);
router.get('/:id', authToken, productController.getProductById);
router.post('/', authToken, authorize('admin'), productController.createProduct);
router.patch('/:id', authToken, authorize('admin'), productController.updateProduct);
router.delete('/:id', authToken, authorize('admin'), productController.deleteProduct);

export default router;
