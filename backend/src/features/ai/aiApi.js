import { Router } from 'express';
import { aiController } from './aiController.js';
const aiApi = Router();

aiApi.post('/summary', aiController.getSummary);
aiApi.post('/chat', aiController.getChat);

export { aiApi };
