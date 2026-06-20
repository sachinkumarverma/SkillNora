import { Router } from 'express';
import { enrollmentsController } from './enrollmentsController.js';

const enrollmentsApi = Router();

enrollmentsApi.post('/', enrollmentsController.createEnrollment);
enrollmentsApi.get('/user', enrollmentsController.getUserEnrollments);

export { enrollmentsApi };
