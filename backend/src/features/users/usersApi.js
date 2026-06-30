import Joi from "joi";
import { usersController } from "./usersController.js";
import { buildApiRouter } from "../../utils/apiLoader.js";

const apiDefinitions = {
  getProfile: {
    path: "/profile",
    verb: "GET",
    handler: { controller: usersController, method: "getProfile" },
    request: {},
    response: Joi.object(),
  },

  getMe: {
    path: "/me",
    verb: "GET",
    handler: { controller: usersController, method: "getProfile" },
    request: {},
    response: Joi.object(),
  },

  getInstructors: {
    path: "/instructors",
    verb: "GET",
    handler: { controller: usersController, method: "getInstructors" },
    request: {},
    response: Joi.object(),
  },

  syncUser: {
    path: "/sync",
    verb: "POST",
    handler: { controller: usersController, method: "syncUser" },
    request: {
      body: {
        id: Joi.string().required(),
        email: Joi.string().email().required(),
        role: Joi.string().optional(),
        full_name: Joi.string().optional(),
      },
    },
    response: Joi.object(),
  },

  updateProfile: {
    path: "/update-profile",
    verb: "POST",
    handler: { controller: usersController, method: "updateProfile" },
    request: {},
    response: Joi.object(),
  },

  sendPromotionalEmail: {
    path: "/promotional-email",
    verb: "POST",
    handler: { controller: usersController, method: "sendPromotionalEmail" },
    request: {
      body: {
        users: Joi.array().items(Joi.string()).required(),
        subject: Joi.string().required(),
        body: Joi.string().required(),
      },
    },
    response: Joi.object(),
  },
};

export const usersApi = buildApiRouter(apiDefinitions);
