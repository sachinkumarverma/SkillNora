import Joi from 'joi';
import { cartController } from './cartController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    getCart: {
        path: '/',
        verb: 'GET',
        handler: { controller: cartController, method: 'getCart' },
        request: {},
        response: Joi.object()
    },

    addToCart: {
        path: '/',
        verb: 'POST',
        handler: { controller: cartController, method: 'addToCart' },
        request: {
            body: {
                course_id: Joi.string().required()
            }
        },
        response: Joi.object()
    },

    removeFromCart: {
        path: '/:courseId',
        verb: 'DELETE',
        handler: { controller: cartController, method: 'removeFromCart' },
        request: {
            params: {
                courseId: Joi.string().required()
            }
        },
        response: Joi.object()
    },

    clearCart: {
        path: '/',
        verb: 'DELETE',
        handler: { controller: cartController, method: 'clearCart' },
        request: {},
        response: Joi.object()
    }
};

export const cartApi = buildApiRouter(apiDefinitions);
