import Joi from 'joi';
import { statisticsController } from './statisticsController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    getStats: {
        path: '/',
        verb: 'GET',
        handler: { controller: statisticsController, method: 'getStats' },
        request: {},
        response: Joi.object()
    }
};

export const statisticsApi = buildApiRouter(apiDefinitions);
