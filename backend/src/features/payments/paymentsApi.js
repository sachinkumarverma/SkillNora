import { Router } from 'express';
import express from 'express';
import { paymentsController } from './paymentsController.js';

const paymentsApi = Router();
paymentsApi.post('/create-order', paymentsController.createOrder);
paymentsApi.post('/webhook', express.text({ type: '*/*' }), paymentsController.webhook);

export { paymentsApi };
