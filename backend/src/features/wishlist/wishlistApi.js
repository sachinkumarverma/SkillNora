import Joi from 'joi';
import { wishlistController } from './wishlistController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    getWishlist: {
        path: '/',
        verb: 'GET',
        handler: { controller: wishlistController, method: 'getWishlist' },
        request: {},
        response: Joi.object()
    },

    addToWishlist: {
        path: '/',
        verb: 'POST',
        handler: { controller: wishlistController, method: 'addToWishlist' },
        request: {
            body: {
                course_id: Joi.string().required()
            }
        },
        response: Joi.object()
    },

    removeFromWishlist: {
        path: '/:courseId',
        verb: 'DELETE',
        handler: { controller: wishlistController, method: 'removeFromWishlist' },
        request: {
            params: {
                courseId: Joi.string().required()
            }
        },
        response: Joi.object()
    }
};

export const wishlistApi = buildApiRouter(apiDefinitions);
