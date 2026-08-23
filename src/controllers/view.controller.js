import userModel from '../models/user.model.js';
import ProductModel from '../models/products.model.js';
import FavoriteModel from '../models/favorites.model.js';

const register = async (req, res) => {
  try {
    res.render('register');
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const login = async (req, res) => {
  try {
    res.render('login');
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const home = async (req, res) => {
  try {
    const products = await ProductModel.find({}).lean();
    res.render('home', { products });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const cart = async (req, res) => {
  res.render('cart');
};

const favorites = async (req, res) => {
  try {
    const userId = req.user?._id || req.session?.user?.id;
    const favorites = await FavoriteModel.find({ userId }).populate('products').lean();
    res.render('favorites', { favorites });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

export const viewController = {
  register,
  login,
  home,
  cart,
  favorites,
};
