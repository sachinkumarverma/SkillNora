import { Router } from 'express';
import { enrollmentsController } from './enrollmentsController.js';

const enrollmentsApi = Router();

enrollmentsApi.post('/', enrollmentsController.enroll);
enrollmentsApi.get('/my', enrollmentsController.getMy);

export { enrollmentsApi };
