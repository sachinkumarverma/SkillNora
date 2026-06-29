import Joi from 'joi';
import { certificatesController } from './certificatesController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    getMyCertificates: {
        path: '/my',
        verb: 'GET',
        handler: { controller: certificatesController, method: 'getMyCertificates' },
        request: {},
        response: Joi.object()
    },

    getCertificateByCode: {
        path: '/:code',
        verb: 'GET',
        handler: { controller: certificatesController, method: 'getCertificateByCode' },
        request: {
            params: {
                code: Joi.string().required()
            }
        },
        response: Joi.object()
    }
};

export const certificatesApi = buildApiRouter(apiDefinitions);
