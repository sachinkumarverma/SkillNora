import Joi from "joi";
import { buildApiRouter } from "../../utils/apiLoader.js";
import { testSeriesController } from "./testSeriesController.js";

const apiDefinitions = {
  getPublicSeries: {
    path: "/test-series",
    verb: "GET",
    handler: { controller: testSeriesController, method: "getPublicSeries" },
    request: {},
    response: Joi.object().keys({ testSeries: Joi.array() }),
  },

  getSeriesDetails: {
    path: "/test-series/:id",
    verb: "GET",
    handler: { controller: testSeriesController, method: "getSeriesDetails" },
    request: { params: { id: Joi.string().required() } },
    response: Joi.object().keys({ series: Joi.object() }),
  },

  getTestDetails: {
    path: "/test-series/test/:testId",
    verb: "GET",
    handler: { controller: testSeriesController, method: "getTestDetails" },
    request: { params: { testId: Joi.string().required() } },
    response: Joi.object().keys({ test: Joi.object() }),
  },

  getInstructorSeries: {
    path: "/instructor/test-series",
    verb: "GET",
    handler: {
      controller: testSeriesController,
      method: "getInstructorSeries",
    },
    request: {},
    response: Joi.object().keys({ testSeries: Joi.array() }),
  },

  createSeries: {
    path: "/instructor/test-series",
    verb: "POST",
    handler: { controller: testSeriesController, method: "createSeries" },
    request: {
      body: {
        title: Joi.string().required(),
        category: Joi.string().allow("").optional(),
        description: Joi.string().allow("").optional(),
        thumbnail_url: Joi.string().allow("").optional(),
      },
    },
    response: Joi.object().keys({ series: Joi.object() }),
  },

  updateSeries: {
    path: "/instructor/test-series/:id",
    verb: "PUT",
    handler: { controller: testSeriesController, method: "updateSeries" },
    request: {
      params: { id: Joi.string().required() },
      body: {},
    },
    response: Joi.object().keys({ series: Joi.object() }),
  },

  deleteSeries: {
    path: "/instructor/test-series/:id",
    verb: "DELETE",
    handler: { controller: testSeriesController, method: "deleteSeries" },
    request: { params: { id: Joi.string().required() } },
    response: Joi.object().keys({ ok: Joi.boolean() }),
  },

  createTest: {
    path: "/instructor/test-series/:seriesId/tests",
    verb: "POST",
    handler: { controller: testSeriesController, method: "createTest" },
    request: {
      params: { seriesId: Joi.string().required() },
      body: {},
    },
    response: Joi.object().keys({ test: Joi.object() }),
  },

  generateQuestionsWithAI: {
    path: "/instructor/test-series/tests/:testId/generate-ai",
    verb: "POST",
    handler: {
      controller: testSeriesController,
      method: "generateQuestionsWithAI",
    },
    request: {
      params: { testId: Joi.string().required() },
    },
    response: Joi.object().keys({ message: Joi.string() }),
  },

  updateTest: {
    path: "/instructor/test-series/tests/:testId",
    verb: "PUT",
    handler: { controller: testSeriesController, method: "updateTest" },
    request: {
      params: { testId: Joi.string().required() },
      body: {},
    },
    response: Joi.object().keys({ test: Joi.object() }),
  },

  deleteTest: {
    path: "/instructor/test-series/tests/:testId",
    verb: "DELETE",
    handler: { controller: testSeriesController, method: "deleteTest" },
    request: { params: { testId: Joi.string().required() } },
    response: Joi.object().keys({ ok: Joi.boolean() }),
  },

  createQuestion: {
    path: "/instructor/test-series/tests/:testId/questions",
    verb: "POST",
    handler: { controller: testSeriesController, method: "createQuestion" },
    request: {
      params: { testId: Joi.string().required() },
      body: {},
    },
    response: Joi.object().keys({ question: Joi.object() }),
  },

  updateQuestion: {
    path: "/instructor/test-series/tests/:testId/questions/:questionId",
    verb: "PUT",
    handler: { controller: testSeriesController, method: "updateQuestion" },
    request: {
      params: {
        testId: Joi.string().required(),
        questionId: Joi.string().required(),
      },
      body: {},
    },
    response: Joi.object().keys({ question: Joi.object() }),
  },

  deleteQuestion: {
    path: "/instructor/test-series/tests/:testId/questions/:questionId",
    verb: "DELETE",
    handler: { controller: testSeriesController, method: "deleteQuestion" },
    request: {
      params: {
        testId: Joi.string().required(),
        questionId: Joi.string().required(),
      },
    },
    response: Joi.object().keys({ ok: Joi.boolean() }),
  },

  getAdminSeries: {
    path: "/admin/test-series",
    verb: "GET",
    handler: { controller: testSeriesController, method: "getAdminSeries" },
    request: {},
    response: Joi.object().keys({ testSeries: Joi.array() }),
  },

  createAdminSeries: {
    path: "/admin/test-series",
    verb: "POST",
    handler: { controller: testSeriesController, method: "createSeries" },
    request: {
      body: {
        title: Joi.string().required(),
        category: Joi.string().allow("").optional(),
        description: Joi.string().allow("").optional(),
        thumbnail_url: Joi.string().allow("").optional(),
      },
    },
    response: Joi.object().keys({ series: Joi.object() }),
  },

  updateAdminSeries: {
    path: "/admin/test-series/:id",
    verb: "PUT",
    handler: { controller: testSeriesController, method: "updateSeries" },
    request: { params: { id: Joi.string().required() }, body: {} },
    response: Joi.object().keys({ series: Joi.object() }),
  },

  deleteAdminSeries: {
    path: "/admin/test-series/:id",
    verb: "DELETE",
    handler: { controller: testSeriesController, method: "deleteSeries" },
    request: { params: { id: Joi.string().required() } },
    response: Joi.object().keys({ ok: Joi.boolean() }),
  },

  createAdminTest: {
    path: "/admin/test-series/:seriesId/tests",
    verb: "POST",
    handler: { controller: testSeriesController, method: "createTest" },
    request: { params: { seriesId: Joi.string().required() }, body: {} },
    response: Joi.object().keys({ test: Joi.object() }),
  },

  generateAdminQuestionsWithAI: {
    path: "/admin/test-series/tests/:testId/generate-ai",
    verb: "POST",
    handler: {
      controller: testSeriesController,
      method: "generateQuestionsWithAI",
    },
    request: { params: { testId: Joi.string().required() } },
    response: Joi.object().keys({ message: Joi.string() }),
  },

  updateAdminTest: {
    path: "/admin/test-series/tests/:testId",
    verb: "PUT",
    handler: { controller: testSeriesController, method: "updateTest" },
    request: { params: { testId: Joi.string().required() }, body: {} },
    response: Joi.object().keys({ test: Joi.object() }),
  },

  deleteAdminTest: {
    path: "/admin/test-series/tests/:testId",
    verb: "DELETE",
    handler: { controller: testSeriesController, method: "deleteTest" },
    request: { params: { testId: Joi.string().required() } },
    response: Joi.object().keys({ ok: Joi.boolean() }),
  },
  createAdminQuestion: {
    path: "/admin/test-series/tests/:testId/questions",
    verb: "POST",
    handler: { controller: testSeriesController, method: "createQuestion" },
    request: { params: { testId: Joi.string().required() }, body: {} },
    response: Joi.object().keys({ question: Joi.object() }),
  },

  updateAdminQuestion: {
    path: "/admin/test-series/tests/:testId/questions/:questionId",
    verb: "PUT",
    handler: { controller: testSeriesController, method: "updateQuestion" },
    request: {
      params: {
        testId: Joi.string().required(),
        questionId: Joi.string().required(),
      },
      body: {},
    },
    response: Joi.object().keys({ question: Joi.object() }),
  },

  deleteAdminQuestion: {
    path: "/admin/test-series/tests/:testId/questions/:questionId",
    verb: "DELETE",
    handler: { controller: testSeriesController, method: "deleteQuestion" },
    request: {
      params: {
        testId: Joi.string().required(),
        questionId: Joi.string().required(),
      },
    },
    response: Joi.object().keys({ ok: Joi.boolean() }),
  },

  getUserAttempts: {
    path: "/attempts",
    verb: "GET",
    handler: { controller: testSeriesController, method: "getUserAttempts" },
    request: {},
    response: Joi.object().keys({ attempts: Joi.array() }),
  },

  startAttempt: {
    path: "/attempts/start/:testId",
    verb: "POST",
    handler: { controller: testSeriesController, method: "startAttempt" },
    request: { params: { testId: Joi.string().required() } },
    response: Joi.object().keys({ attempt: Joi.object() }),
  },

  saveProgress: {
    path: "/attempts/:attemptId/save",
    verb: "PUT",
    handler: { controller: testSeriesController, method: "saveProgress" },
    request: {
      params: { attemptId: Joi.string().required() },
      body: {},
    },
    response: Joi.object().keys({ ok: Joi.boolean() }),
  },

  submitAttempt: {
    path: "/attempts/:attemptId/submit",
    verb: "POST",
    handler: { controller: testSeriesController, method: "submitAttempt" },
    request: {
      params: { attemptId: Joi.string().required() },
      body: {},
    },
    response: Joi.object().keys({ attempt: Joi.object() }),
  },

  getAttemptAnalysis: {
    path: "/attempts/analysis/:testId",
    verb: "GET",
    handler: { controller: testSeriesController, method: "getAttemptAnalysis" },
    request: {
      params: { testId: Joi.string().required() },
    },
    response: Joi.object().keys({ analysis: Joi.object() }),
  },
};

export const testSeriesApi = buildApiRouter(apiDefinitions);
