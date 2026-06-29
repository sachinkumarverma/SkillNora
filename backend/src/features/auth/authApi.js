import Joi from 'joi';
import { usersController } from '../users/usersController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    logout: {
        path: '/logout',
        verb: 'POST',
        handler: { controller: usersController, method: 'logout' },
        request: {},
        response: Joi.object()
    },

    updatePassword: {
        path: '/update-password',
        verb: 'POST',
        handler: { controller: usersController, method: 'updatePassword' },
        request: {
            body: {
                password: Joi.string().required()
            }
        },
        response: Joi.object()
    }
};

export const authApi = buildApiRouter(apiDefinitions);
