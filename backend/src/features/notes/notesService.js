import { notesRepository } from './notesRepository.js';

const getNotes = (userId) => notesRepository.getNotes(userId);
const saveNote = (userId, courseId, lectureId, text) => notesRepository.saveNote(userId, courseId, lectureId, text);
const deleteNote = (userId, noteId) => notesRepository.deleteNote(userId, noteId);
const bulkDeleteNotes = (userId, noteIds) => notesRepository.bulkDeleteNotes(userId, noteIds);

export const notesService = {
  getNotes,
  saveNote,
  deleteNote,
  bulkDeleteNotes
};
