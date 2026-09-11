import { cartsRepository } from '../repositories/carts.repository.js';
import { productsRepository } from '../repositories/products.repository.js';

// Capa de Lógica de Negocio (Service) para Carritos.
// Contiene las validaciones de existencia, pertenencia y adición de productos.
class CartsService {
  async getCartById(cartId) {
    return cartsRepository.getById(cartId);
  }

  // Agregar producto al carrito validando que pertenezca al usuario autenticado
  async addProduct({ cartId, productId, user }) {
    // 1. Validar existencia del carrito
    const cart = await cartsRepository.getById(cartId);
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validar que el usuario sea el dueño del carrito (únicamente mediante cart.userId === user._id)
    const cartOwnerId = (cart.userId?._id || cart.userId)?.toString();
    const authenticatedUserId = (user?._id || user?.id)?.toString();

    const isOwner =
      cartOwnerId &&
      authenticatedUserId &&
      cartOwnerId === authenticatedUserId;

    if (!isOwner) {
      const error = new Error('No tiene permisos para modificar este carrito');
      error.statusCode = 403;
      throw error;
    }

    // 3. Validar que el producto exista en el catálogo
    const product = await productsRepository.getById(productId);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // 4. Agregar el producto o incrementar su cantidad
    return cartsRepository.addOrIncrementProduct(cartId, productId);
  }
}

export const cartsService = new CartsService();
