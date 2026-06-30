import Joi from "joi";
import { aiController } from "./aiController.js";
import { buildApiRouter } from "../../utils/apiLoader.js";

const apiDefinitions = {
  getSummary: {
    path: "/summary",
    verb: "POST",
    handler: { controller: aiController, method: "getSummary" },
    request: {
      body: {
        text: Joi.string().required(),
      },
    },
    response: Joi.object(),
  },

  getChat: {
    path: "/chat",
    verb: "POST",
    handler: { controller: aiController, method: "getChat" },
    request: {
      body: {
        messages: Joi.array().optional(),
      },
    },
    response: Joi.object(),
  },
};

export const aiApi = buildApiRouter(apiDefinitions);
