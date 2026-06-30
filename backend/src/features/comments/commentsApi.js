import Joi from "joi";
import { commentsController } from "./commentsController.js";
import { buildApiRouter } from "../../utils/apiLoader.js";

const apiDefinitions = {
  getComments: {
    path: "/",
    verb: "GET",
    handler: { controller: commentsController, method: "getComments" },
    request: {
      query: {
        slug: Joi.string().required(),
        lectureId: Joi.string().required(),
      },
    },
    response: Joi.object(),
  },

  postComment: {
    path: "/",
    verb: "POST",
    handler: { controller: commentsController, method: "postComment" },
    request: {
      body: {
        course_slug: Joi.string().required(),
        lecture_id: Joi.string().required(),
        parent_id: Joi.string().optional().allow(null),
        user_name: Joi.string().required(),
        text: Joi.string().required(),
      },
    },
    response: Joi.object(),
  },

  deleteComment: {
    path: "/:id",
    verb: "DELETE",
    handler: { controller: commentsController, method: "deleteComment" },
    request: {
      params: {
        id: Joi.string().required(),
      },
    },
    response: Joi.object(),
  },

  reactToComment: {
    path: "/:id/react",
    verb: "POST",
    handler: { controller: commentsController, method: "reactToComment" },
    request: {
      params: {
        id: Joi.string().required(),
      },
      body: {
        emoji: Joi.string().required(),
      },
    },
    response: Joi.object(),
  },
};

export const commentsApi = buildApiRouter(apiDefinitions);
