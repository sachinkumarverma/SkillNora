import { Router } from 'express';
import { coursesController } from './coursesController.js';

const coursesApi = Router();

coursesApi.get('/admin', coursesController.listAdmin);
coursesApi.post('/bulk-publish', coursesController.bulkPublish);
coursesApi.post('/bulk-delete', coursesController.bulkDelete);
coursesApi.post('/delete-with-refund', coursesController.deleteWithRefund);
coursesApi.post('/:id/lectures', coursesController.updateLectures);
coursesApi.get('/', coursesController.list);
coursesApi.get('/:id', coursesController.getOne);
coursesApi.post('/', coursesController.create);
coursesApi.put('/:id', coursesController.update);
coursesApi.delete('/:id', coursesController.removeCourse);
coursesApi.post('/complete', coursesController.complete);
coursesApi.post('/:id/reviews', coursesController.addReview);
coursesApi.put('/:id/reviews/:reviewId', coursesController.updateReview);

export { coursesApi };
