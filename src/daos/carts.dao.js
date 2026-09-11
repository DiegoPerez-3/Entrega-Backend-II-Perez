import cartModel from '../models/cart.model.js';

// Capa de Acceso a Datos (DAO) para Carritos.
// Se encarga de interactuar directamente con cartModel en MongoDB.
class CartsDao {
  // Buscar carrito por su ID poblando los detalles de los productos vinculados
  async getById(id) {
    return cartModel.findById(id).populate('products.productId');
  }

  // Crear un nuevo carrito vacío asignado a un usuario
  async create(data) {
    return cartModel.create(data);
  }

  // Agrega un producto al carrito o incrementa su cantidad si ya estaba agregado
  async addOrIncrementProduct(cartId, productId) {
    const cart = await cartModel.findById(cartId);
    if (!cart) return null;

    // Buscamos si el producto ya forma parte del carrito
    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (existingProductIndex !== -1) {
      // Si ya existe, incrementamos la cantidad en 1
      cart.products[existingProductIndex].quantity += 1;
    } else {
      // Si es un producto nuevo en el carrito, lo agregamos con cantidad inicial 1
      cart.products.push({ productId, quantity: 1 });
    }

    await cart.save();
    return cartModel.findById(cartId).populate('products.productId');
  }

  // Actualiza la lista completa de productos del carrito (usado luego de una compra para dejar solo los no procesados)
  async setProducts(cartId, products) {
    return cartModel
      .findByIdAndUpdate(cartId, { products }, { new: true, returnDocument: 'after' })
      .populate('products.productId');
  }

  // Eliminar un carrito por su ID
  async deleteById(id) {
    return cartModel.findByIdAndDelete(id);
  }
}

export const cartsDao = new CartsDao();
