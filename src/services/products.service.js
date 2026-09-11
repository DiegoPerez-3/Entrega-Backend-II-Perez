import { productsRepository } from '../repositories/products.repository.js';

// Capa de Lógica de Negocio (Service) para Productos.
class ProductsService {
  // Retorna el catálogo completo
  async getProducts() {
    return productsRepository.getAll();
  }

  // Busca producto por ID
  async getProductById(id) {
    return productsRepository.getById(id);
  }

  // Validación de datos y creación de nuevo producto
  async createProduct(data) {
    const { title, description, price, stock, thumbnail, category } = data;
    if (!title || price === undefined || stock === undefined) {
      throw new Error('Faltan datos obligatorios');
    }
    return productsRepository.create({
      title,
      description: description || '',
      price: Number(price),
      stock: Number(stock),
      thumbnail: thumbnail || '',
      category: category || '',
    });
  }

  // Actualización de producto existente
  async updateProduct(id, data) {
    const product = await productsRepository.getById(id);
    if (!product) {
      return null;
    }
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.stock !== undefined) updateData.stock = Number(data.stock);
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.category !== undefined) updateData.category = data.category;

    return productsRepository.updateById(id, updateData);
  }

  // Eliminación de producto del catálogo
  async deleteProduct(id) {
    const product = await productsRepository.getById(id);
    if (!product) {
      return null;
    }
    return productsRepository.deleteById(id);
  }
}

export const productsService = new ProductsService();
