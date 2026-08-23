import FavoriteModel from '../models/favorites.model.js';
import mongoose from 'mongoose';

const addToFavorites = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ status: 'error', message: 'Body vacío o mal formado' });
  }

  const userId = req.session.user.id;

  const { productId } = req.body;

  if (!productId) return res.json({ status: 'error', message: 'falta productId' });

  try {
    const favoriteExists = await FavoriteModel.findOne({ userId });
    if (!favoriteExists) {
      const favorite = await FavoriteModel.create({
        userId: userId,
        products: [productId],
      });
      return res.json({ status: 'success', message: 'favorite created', data: favorite });
    }
    const productExists = favoriteExists.products.find((product) => {
      console.log(product.toString());
      console.log(productId);
      return product.toString() === productId;
    });
    console.log('dsfsadfa');
    if (productExists) return res.json({ status: 'error', message: 'product already exists' });
    const favorite = await FavoriteModel.findOneAndUpdate(
      { userId },
      { $push: { products: productId } },
      { new: true },
    );
    return res.json({ status: 'success', message: 'product add' });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const favorites = await FavoriteModel.find({ userId }).populate('products').lean();
    console.log(favorites);
    res.json({ status: 'success', message: 'favorites', data: favorites.products });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

const removeFromFavorites = async (req, res) => {
  const { productId } = req.params;
  try {
    const favorite = await FavoriteModel.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { new: true },
    );
    if (!favorite) return res.json({ status: 'error', message: 'favorite not found' });
    res.json({ status: 'success', message: 'product removed from favorites', data: favorite });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
};

export const favoritesController = {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
};
