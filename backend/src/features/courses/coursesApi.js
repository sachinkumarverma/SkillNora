import Joi from 'joi';
import { coursesController } from './coursesController.js';
import { buildApiRouter } from '../../utils/apiLoader.js';

const apiDefinitions = {
    listAdmin: {
        path: '/admin',
        verb: 'GET',
        handler: { controller: coursesController, method: 'listAdmin' },
        request: {},
        response: Joi.object().keys({ courses: Joi.array() })
    },

    bulkPublish: {
        path: '/bulk-publish',
        verb: 'POST',
        handler: { controller: coursesController, method: 'bulkPublish' },
        request: {
            body: {
                ids: Joi.array().items(Joi.string()).required(),
                status: Joi.boolean().required()
            }
        },
        response: Joi.object().keys({ ok: Joi.boolean() })
    },

    bulkDelete: {
        path: '/bulk-delete',
        verb: 'POST',
        handler: { controller: coursesController, method: 'bulkDelete' },
        request: {
            body: { ids: Joi.array().items(Joi.string()).required() }
        },
        response: Joi.object().keys({ ok: Joi.boolean() })
    },

    deleteWithRefund: {
        path: '/delete-with-refund',
        verb: 'POST',
        handler: { controller: coursesController, method: 'deleteWithRefund' },
        request: {
            body: { ids: Joi.array().items(Joi.string()).required() }
        },
        response: Joi.object().keys({ success: Joi.boolean() })
    },

    updateLectures: {
        path: '/:id/lectures',
        verb: 'POST',
        handler: { controller: coursesController, method: 'updateLectures' },
        request: {
            params: { id: Joi.string().required() },
            body: { lectures: Joi.array().required() }
        },
        response: Joi.object().keys({ ok: Joi.boolean() })
    },

    list: {
        path: '/',
        verb: 'GET',
        handler: { controller: coursesController, method: 'list' },
        request: {},
        response: Joi.object().keys({ courses: Joi.array() })
    },

    getOne: {
        path: '/:id',
        verb: 'GET',
        handler: { controller: coursesController, method: 'getOne' },
        request: {
            params: { id: Joi.string().required() }
        },
        response: Joi.object().keys({ course: Joi.object() })
    },

    create: {
        path: '/',
        verb: 'POST',
        handler: { controller: coursesController, method: 'create' },
        request: {
            body: { title: Joi.string().required() }
        },
        response: Joi.object().keys({ course: Joi.object() })
    },

    update: {
        path: '/:id',
        verb: 'PUT',
        handler: { controller: coursesController, method: 'update' },
        request: {
            params: { id: Joi.string().required() }
        },
        response: Joi.object().keys({ course: Joi.object() })
    },

    removeCourse: {
        path: '/:id',
        verb: 'DELETE',
        handler: { controller: coursesController, method: 'removeCourse' },
        request: {
            params: { id: Joi.string().required() }
        },
        response: Joi.object().keys({ ok: Joi.boolean() })
    },

    complete: {
        path: '/complete',
        verb: 'POST',
        handler: { controller: coursesController, method: 'complete' },
        request: {
            body: {
                courseId: Joi.string().required(),
                slug: Joi.string().required(),
                lectureId: Joi.string().required(),
                totalLectures: Joi.number().required(),
                quizScore: Joi.number().optional()
            }
        },
        response: Joi.object()
    },

    addReview: {
        path: '/:id/reviews',
        verb: 'POST',
        handler: { controller: coursesController, method: 'addReview' },
        request: {
            params: { id: Joi.string().required() },
            body: {
                rating: Joi.number().min(1).max(5).required(),
                review_text: Joi.string().optional().allow('')
            }
        },
        response: Joi.object()
    },

    updateReview: {
        path: '/:id/reviews/:reviewId',
        verb: 'PUT',
        handler: { controller: coursesController, method: 'updateReview' },
        request: {
            params: {
                id: Joi.string().required(),
                reviewId: Joi.string().required()
            },
            body: {
                rating: Joi.number().min(1).max(5).required(),
                review_text: Joi.string().optional().allow('')
            }
        },
        response: Joi.object()
    }
};

export const coursesApi = buildApiRouter(apiDefinitions);
