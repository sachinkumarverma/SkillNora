import { Router } from 'express';
import { notificationsController } from './notificationsController.js';

export const notificationsApi = Router();

notificationsApi.get('/user', notificationsController.getUserNotifications);
notificationsApi.post('/read', notificationsController.markRead);
