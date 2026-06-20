import { Router } from 'express';
import { cartController } from './cartController.js';
export const cartApi = Router();
cartApi.get('/', cartController.getCart);
cartApi.post('/', cartController.addToCart);
cartApi.delete('/:courseId', cartController.removeFromCart);
cartApi.delete('/', cartController.clearCart);
