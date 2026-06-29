import Joi from 'joi';
import { notificationsController } from './notificationsController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    getUserNotifications: {
        path: '/user',
        verb: 'GET',
        handler: { controller: notificationsController, method: 'getUserNotifications' },
        request: {},
        response: Joi.object()
    },

    markRead: {
        path: '/read',
        verb: 'POST',
        handler: { controller: notificationsController, method: 'markRead' },
        request: {},
        response: Joi.object()
    }
};

export const notificationsApi = buildApiRouter(apiDefinitions);
