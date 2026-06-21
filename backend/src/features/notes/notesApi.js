import { Router } from 'express';
import { notesController } from './notesController.js';
export const notesApi = Router();
notesApi.get('/', notesController.getNotes);
notesApi.post('/', notesController.saveNote);
notesApi.delete('/:noteId', notesController.deleteNote);
notesApi.post('/bulk-delete', notesController.bulkDeleteNotes);
