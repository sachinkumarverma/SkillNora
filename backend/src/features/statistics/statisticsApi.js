import { Router } from 'express'
import { statisticsController } from './statisticsController.js'

const statisticsApi = Router();
statisticsApi.get('/', statisticsController.getStats);

export { statisticsApi };
