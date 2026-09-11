import { cartsService } from '../services/carts.service.js';
import { purchaseService } from '../services/purchase.service.js';

// Controlador fino para Carritos.
// Recibe la petición, delega la lógica de negocio al Service y retorna la respuesta.
const addProduct = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const user = req.user; // Provisto por passportCall('current')

    const updatedCart = await cartsService.addProduct({
      cartId: cid,
      productId: pid,
      user,
    });

    res.status(200).json({
      status: 'success',
      message: 'Producto agregado al carrito exitosamente',
      payload: updatedCart,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message,
    });
  }
};

const purchase = async (req, res) => {
  try {
    const { cid } = req.params;
    const user = req.user; // Provisto por passportCall('current')

    const result = await purchaseService.purchaseCart({
      cartId: cid,
      user,
    });

    res.status(200).json({
      status: 'success',
      message: 'Compra procesada exitosamente',
      payload: result.ticket,
      notProcessed: result.notProcessed,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message,
      notProcessed: error.notProcessed || [],
    });
  }
};

export const cartController = {
  addProduct,
  purchase,
};
