import { Router } from 'express';
import { usersController } from './usersController.js';

const usersApi = Router();
usersApi.get('/profile', usersController.getProfile);
usersApi.get('/me', usersController.getProfile);
usersApi.get('/instructors', usersController.getInstructors);
usersApi.post('/sync', usersController.syncUser);
usersApi.post('/update-profile', usersController.updateProfile);

export { usersApi };
