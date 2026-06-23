import { Router } from 'express';
import { usersController } from '../users/usersController.js';

const authApi = Router();

authApi.post('/logout', usersController.logout);
authApi.post('/update-password', usersController.updatePassword);

export { authApi };
