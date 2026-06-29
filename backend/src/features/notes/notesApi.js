import Joi from 'joi';
import { notesController } from './notesController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    getNotes: {
        path: '/',
        verb: 'GET',
        handler: { controller: notesController, method: 'getNotes' },
        request: {},
        response: Joi.object()
    },

    saveNote: {
        path: '/',
        verb: 'POST',
        handler: { controller: notesController, method: 'saveNote' },
        request: {
            body: {
                course_id: Joi.string().required(),
                lecture_id: Joi.string().required(),
                text: Joi.string().required()
            }
        },
        response: Joi.object()
    },

    deleteNote: {
        path: '/:noteId',
        verb: 'DELETE',
        handler: { controller: notesController, method: 'deleteNote' },
        request: {
            params: {
                noteId: Joi.string().required()
            }
        },
        response: Joi.object()
    },

    bulkDeleteNotes: {
        path: '/bulk-delete',
        verb: 'POST',
        handler: { controller: notesController, method: 'bulkDeleteNotes' },
        request: {
            body: {
                noteIds: Joi.array().items(Joi.string()).required()
            }
        },
        response: Joi.object()
    }
};

export const notesApi = buildApiRouter(apiDefinitions);
