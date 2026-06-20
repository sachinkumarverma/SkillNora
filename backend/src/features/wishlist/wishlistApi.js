import { Router } from 'express';
import { wishlistController } from './wishlistController.js';
export const wishlistApi = Router();
wishlistApi.get('/', wishlistController.getWishlist);
wishlistApi.post('/', wishlistController.addToWishlist);
wishlistApi.delete('/:courseId', wishlistController.removeFromWishlist);
