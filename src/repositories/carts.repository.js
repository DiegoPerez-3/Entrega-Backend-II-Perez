import { cartsDao } from '../daos/carts.dao.js';

// Patrón Repository para Carritos.
// Intermedia entre CartsService / PurchaseService y cartsDao.
class CartsRepository {
  async getById(id) {
    return cartsDao.getById(id);
  }

  async create(data) {
    return cartsDao.create(data);
  }

  async addOrIncrementProduct(cartId, productId) {
    return cartsDao.addOrIncrementProduct(cartId, productId);
  }

  async setProducts(cartId, products) {
    return cartsDao.setProducts(cartId, products);
  }

  async deleteById(id) {
    return cartsDao.deleteById(id);
  }
}

export const cartsRepository = new CartsRepository();
