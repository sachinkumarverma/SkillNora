import express from 'express';
import * as supportController from './supportController.js';

const router = express.Router();

// Public route
router.post('/', supportController.createTicket);

// Admin routes
router.get('/admin/all', supportController.getAdminTickets);
router.post('/admin/:id/resolve', supportController.resolveTicket);

export const supportApi = router;
