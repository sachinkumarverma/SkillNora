import Joi from "joi";
import express from "express";
import { paymentsController } from "./paymentsController.js";
import { buildApiRouter } from "../../utils/apiLoader.js";

const apiDefinitions = {
  createOrder: {
    path: "/create-order",
    verb: "POST",
    handler: { controller: paymentsController, method: "createOrder" },
    request: {
      body: {
        amount: Joi.number().required(),
        currency: Joi.string().optional(),
        receipt: Joi.string().optional(),
        user_id: Joi.string().optional(),
        course_id: Joi.string().optional(),
      },
    },
    response: Joi.object(),
  },

  webhook: {
    path: "/webhook",
    verb: "POST",
    handler: { controller: paymentsController, method: "webhook" },
    middlewares: [express.text({ type: "*/*" })],
    request: {},
    response: Joi.object(),
  },

  recordOrderAndEnroll: {
    path: "/record-order-and-enroll",
    verb: "POST",
    handler: { controller: paymentsController, method: "recordOrderAndEnroll" },
    request: {
      body: {
        orderId: Joi.string().required(),
        totalAmount: Joi.number().required(),
        enrollments: Joi.array().required(),
      },
    },
    response: Joi.object(),
  },
};

export const paymentsApi = buildApiRouter(apiDefinitions);
