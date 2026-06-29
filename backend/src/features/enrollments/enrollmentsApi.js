import Joi from 'joi';
import { enrollmentsController } from './enrollmentsController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    createEnrollment: {
        path: '/',
        verb: 'POST',
        handler: { controller: enrollmentsController, method: 'createEnrollment' },
        request: {
            body: {
                course_id: Joi.string().required()
            }
        },
        response: Joi.object()
    },

    getUserEnrollments: {
        path: '/user',
        verb: 'GET',
        handler: { controller: enrollmentsController, method: 'getUserEnrollments' },
        request: {},
        response: Joi.object()
    },

    cancelEnrollment: {
        path: '/cancel',
        verb: 'POST',
        handler: { controller: enrollmentsController, method: 'cancelEnrollment' },
        request: {
            body: {
                course_id: Joi.string().required()
            }
        },
        response: Joi.object()
    }
};

export const enrollmentsApi = buildApiRouter(apiDefinitions);
