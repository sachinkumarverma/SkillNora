import Joi from "joi";
import { uploadController } from "./uploadController.js";
import { buildApiRouter } from "../../utils/apiLoader.js";

const apiDefinitions = {
  getUrl: {
    path: "/url",
    verb: "POST",
    handler: { controller: uploadController, method: "getUrl" },
    request: {
      body: {
        bucket: Joi.string().optional(),
        filePath: Joi.string().required(),
      },
    },
    response: Joi.object(),
  },
};

export const uploadApi = buildApiRouter(apiDefinitions);
