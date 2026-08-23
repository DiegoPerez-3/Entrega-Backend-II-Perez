import productsModel from '../models/products.model.js';

const getProducts = async (req, res) => {
  try {
    const products = await productsModel.find({});
    res.json({ status: 'success', payload: products });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const getProductById = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ status: 'error', message: 'id invalido' });
  try {
    const product = await productsModel.findOne({ _id: id });
    if (!product) return res.json({ status: 'error', message: 'id invalido' });
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const createProduct = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ status: 'error', message: 'Body vacío o mal formado' });
  }
  const { title, description, price, stock, thumbnail, category } = req.body;
  if (!title || !price || !stock) return res.json({ status: 'error', message: 'faltan datos' });
  try {
    const product = await productsModel.create({ title, price, stock, description, thumbnail, category });
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ status: 'error', message: 'id invalido' });
  if (!req.body) {
    return res.status(400).json({ status: 'error', message: 'Body vacío o mal formado' });
  }
  const { title, description, price, stock } = req.body;
  try {
    const product = await productsModel.findOne({ _id: id });
    if (!product) return res.json({ status: 'error', message: 'id invalido' });
    const productUpdated = await productsModel.findByIdAndUpdate(
      { _id: id },
      { title, description, price, stock },
      { new: true },
    );
    res.json({ status: 'success', payload: productUpdated });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ status: 'error', message: 'id invalido' });
  try {
    const product = await productsModel.findOne({ _id: id });
    if (!product) return res.json({ status: 'error', message: 'id invalido' });
    const productDeleted = await productsModel.findByIdAndDelete({ _id: id });
    const productFound = await productsModel.findOne({ _id: id });
    if (productFound)
      return res.json({ status: 'error', message: 'Error al eliminar el producto' });
    res.json({ status: 'success', payload: productDeleted });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

export const productController = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
