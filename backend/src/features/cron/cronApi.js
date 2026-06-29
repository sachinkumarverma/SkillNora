import Joi from 'joi';
import { cronController } from './cronController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    sendDailyRecommendations: {
        path: '/recommendations',
        verb: 'POST',
        handler: { controller: cronController, method: 'sendDailyRecommendations' },
        request: {},
        response: Joi.object()
    }
};

export const cronApi = buildApiRouter(apiDefinitions);
