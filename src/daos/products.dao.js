import productsModel from '../models/products.model.js';

// Capa de Acceso a Datos (DAO) para Productos.
// Maneja todas las consultas directas a la colección de productos en MongoDB.
class ProductsDao {
  // Obtener catálogo completo de productos
  async getAll() {
    return productsModel.find({});
  }

  // Buscar un producto específico por su ID
  async getById(id) {
    return productsModel.findById(id);
  }

  // Guardar un nuevo producto
  async create(data) {
    return productsModel.create(data);
  }

  // Actualizar un producto existente retornando el documento modificado
  async updateById(id, data) {
    return productsModel.findByIdAndUpdate(id, data, {
      new: true,
      returnDocument: 'after',
      runValidators: true,
    });
  }

  // Eliminar un producto por su ID
  async deleteById(id) {
    return productsModel.findByIdAndDelete(id);
  }

  // Decremento atómico de stock:
  // Condiciona la actualización a que el stock disponible sea mayor o igual a la cantidad solicitada ($gte).
  // Si hay stock, lo descuenta con $inc. Si no alcanza el stock, devuelve null y no modifica la base de datos.
  // Esto previene que el stock quede negativo ante solicitudes simultáneas.
  async decrementStockIfAvailable(id, quantity) {
    return productsModel.findOneAndUpdate(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true, returnDocument: 'after' }
    );
  }
}

export const productsDao = new ProductsDao();
