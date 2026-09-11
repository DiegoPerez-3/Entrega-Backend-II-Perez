import { productsDao } from '../daos/products.dao.js';

// Patrón Repository para Productos.
// Encapsula las operaciones del DAO de productos para ser utilizadas por los Services.
class ProductsRepository {
  async getAll() {
    return productsDao.getAll();
  }

  async getById(id) {
    return productsDao.getById(id);
  }

  async create(data) {
    return productsDao.create(data);
  }

  async updateById(id, data) {
    return productsDao.updateById(id, data);
  }

  async deleteById(id) {
    return productsDao.deleteById(id);
  }

  async decrementStockIfAvailable(id, quantity) {
    return productsDao.decrementStockIfAvailable(id, quantity);
  }
}

export const productsRepository = new ProductsRepository();
