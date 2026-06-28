import express from 'express';
import { cronController } from './cronController.js';

const router = express.Router();

router.post('/recommendations', cronController.sendDailyRecommendations);

export { router as cronApi };
