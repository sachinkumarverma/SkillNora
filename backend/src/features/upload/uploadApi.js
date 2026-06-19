import { Router } from 'express';
import { uploadController } from './uploadController.js';

const uploadApi = Router();
uploadApi.post('/url', uploadController.getUrl);

export { uploadApi };
