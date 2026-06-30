import { wishlistRepository } from "./wishlistRepository.js";

const getWishlist = (userId) => wishlistRepository.getWishlist(userId);
const addToWishlist = (userId, courseId) =>
  wishlistRepository.addToWishlist(userId, courseId);
const removeFromWishlist = (userId, courseId) =>
  wishlistRepository.removeFromWishlist(userId, courseId);

export const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
