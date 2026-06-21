import { Router } from 'express'
import { commentsController } from './commentsController.js'

const commentsApi = Router();
commentsApi.get('/', commentsController.getComments);
commentsApi.post('/', commentsController.postComment);
commentsApi.delete('/:id', commentsController.deleteComment);
commentsApi.post('/:id/react', commentsController.reactToComment);

export { commentsApi };
