import crypto from 'node:crypto';
import { cartsRepository } from '../repositories/carts.repository.js';
import { productsRepository } from '../repositories/products.repository.js';
import { ticketsRepository } from '../repositories/tickets.repository.js';

// Capa de Lógica de Negocio (Service) para el proceso de compra (Purchase).
// Contiene la verificación de stock, cálculo de totales, compras completas/parciales y generación del Ticket.
class PurchaseService {
  async purchaseCart({ cartId, user }) {
    // 1. Obtener el carrito desde el repositorio
    const cart = await cartsRepository.getById(cartId);
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validar que el carrito pertenezca al usuario autenticado (únicamente mediante cart.userId === user._id)
    const cartOwnerId = (cart.userId?._id || cart.userId)?.toString();
    const authenticatedUserId = (user?._id || user?.id)?.toString();

    const isOwner =
      cartOwnerId &&
      authenticatedUserId &&
      cartOwnerId === authenticatedUserId;

    if (!isOwner) {
      const error = new Error('No tiene permisos para comprar este carrito');
      error.statusCode = 403;
      throw error;
    }

    // 3. Verificar que el carrito contenga productos
    if (!cart.products || cart.products.length === 0) {
      const error = new Error('El carrito no contiene productos');
      error.statusCode = 400;
      throw error;
    }

    let totalAmount = 0;
    const purchasedProducts = [];
    const notProcessed = [];

    // 4. Recorrer cada producto del carrito para validar y descontar stock
    for (const item of cart.products) {
      const rawProduct = item.productId;
      const productId = rawProduct?._id || rawProduct;
      const quantity = item.quantity;

      // Intentamos descontar stock de forma atómica en la base de datos
      const updatedProduct = await productsRepository.decrementStockIfAvailable(productId, quantity);

      if (updatedProduct) {
        // Si la actualización tuvo éxito, hay stock suficiente
        const itemPrice = updatedProduct.price;
        totalAmount += itemPrice * quantity;
        purchasedProducts.push({
          productId: productId.toString(),
          quantity,
          price: itemPrice,
        });
      } else {
        // Si no hay stock suficiente, no se descuenta nada y se aparta como no procesado
        notProcessed.push({
          productId: productId.toString(),
          quantity,
        });
      }
    }

    // 5. Si ningún producto pudo comprarse, no se emite ticket con monto 0
    if (purchasedProducts.length === 0) {
      const error = new Error('No hay stock suficiente para procesar la compra de los productos en el carrito');
      error.statusCode = 409;
      error.notProcessed = notProcessed;
      throw error;
    }

    // 6. Generar el Ticket de compra por los productos efectivamente comprados
    const ticketCode = crypto.randomUUID();
    const ticket = await ticketsRepository.create({
      code: ticketCode,
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: user.email,
    });

    // 7. Actualizar el carrito: los comprados salen y solo permanecen los no procesados
    await cartsRepository.setProducts(cartId, notProcessed);

    return {
      ticket,
      notProcessed,
    };
  }
}

export const purchaseService = new PurchaseService();
