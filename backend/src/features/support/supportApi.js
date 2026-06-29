import Joi from 'joi';
import * as supportController from './supportController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    createTicket: {
        path: '/',
        verb: 'POST',
        handler: { controller: supportController, method: 'createTicket' },
        request: {
            body: {
                name: Joi.string().required(),
                email: Joi.string().email().required(),
                subject: Joi.string().required(),
                message: Joi.string().required()
            }
        },
        response: Joi.object()
    },

    getAdminTickets: {
        path: '/admin/all',
        verb: 'GET',
        handler: { controller: supportController, method: 'getAdminTickets' },
        request: {},
        response: Joi.object()
    },

    resolveTicket: {
        path: '/admin/:id/resolve',
        verb: 'POST',
        handler: { controller: supportController, method: 'resolveTicket' },
        request: {
            params: {
                id: Joi.string().required()
            },
            body: {
                adminMessage: Joi.string().required()
            }
        },
        response: Joi.object()
    }
};

export const supportApi = buildApiRouter(apiDefinitions);
