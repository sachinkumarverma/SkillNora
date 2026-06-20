import { cartRepository } from './cartRepository.js';

const getCart = (userId) => cartRepository.getCart(userId);
const addToCart = (userId, courseId) => cartRepository.addToCart(userId, courseId);
const removeFromCart = (userId, courseId) => cartRepository.removeFromCart(userId, courseId);
const clearCart = (userId) => cartRepository.clearCart(userId);

export const cartService = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
