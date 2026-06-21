import { Router } from 'express';
import { adminController } from './adminController.js';

const router = Router();

router.get('/students', adminController.getStudents);
router.get('/payments', adminController.getPayments);
router.get('/enrollments', adminController.getEnrollments);
router.get('/certificates', adminController.getCertificates);
router.get('/instructors', adminController.getInstructors);
router.get('/reviews', adminController.getReviews);
router.get('/notifications', adminController.getNotifications);
router.get('/categories', adminController.getCategories);

export { router as adminApi };
