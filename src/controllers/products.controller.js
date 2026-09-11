import { productsService } from '../services/products.service.js';

// Controlador fino para Productos.
// No importa modelos de Mongoose directamente; consume la lógica de productsService.
const getProducts = async (req, res) => {
  try {
    const products = await productsService.getProducts();
    res.status(200).json({ status: 'success', payload: products });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'ID inválido' });
    }
    const product = await productsService.getProductById(id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.status(200).json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ status: 'error', message: 'Body vacío o mal formado' });
    }
    const { title, description, price, stock, thumbnail, category } = req.body;
    if (!title || price === undefined || stock === undefined) {
      return res.status(400).json({ status: 'error', message: 'Faltan datos obligatorios' });
    }

    const newProduct = await productsService.createProduct({
      title,
      description,
      price,
      stock,
      thumbnail,
      category,
    });
    res.status(201).json({ status: 'success', payload: newProduct });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'ID inválido' });
    }
    if (!req.body) {
      return res.status(400).json({ status: 'error', message: 'Body vacío o mal formado' });
    }

    const updatedProduct = await productsService.updateProduct(id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.status(200).json({ status: 'success', payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'ID inválido' });
    }

    const deletedProduct = await productsService.deleteProduct(id);
    if (!deletedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.status(200).json({ status: 'success', payload: deletedProduct });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const productController = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
