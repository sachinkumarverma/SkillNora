import { Router } from 'express';
import { notificationsController } from './notificationsController.js';

export const notificationsApi = Router();

notificationsApi.get('/my', notificationsController.getMy);
notificationsApi.post('/read', notificationsController.markRead);
