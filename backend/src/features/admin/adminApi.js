import Joi from "joi";
import { adminController } from "./adminController.js";
import { buildApiRouter } from "../../utils/apiLoader.js";

const apiDefinitions = {
  getStudents: {
    path: "/students",
    verb: "GET",
    handler: { controller: adminController, method: "getStudents" },
    request: {},
    response: Joi.object(),
  },

  getPayments: {
    path: "/payments",
    verb: "GET",
    handler: { controller: adminController, method: "getPayments" },
    request: {},
    response: Joi.object(),
  },

  getEnrollments: {
    path: "/enrollments",
    verb: "GET",
    handler: { controller: adminController, method: "getEnrollments" },
    request: {},
    response: Joi.object(),
  },

  getCertificates: {
    path: "/certificates",
    verb: "GET",
    handler: { controller: adminController, method: "getCertificates" },
    request: {},
    response: Joi.object(),
  },

  getInstructors: {
    path: "/instructors",
    verb: "GET",
    handler: { controller: adminController, method: "getInstructors" },
    request: {},
    response: Joi.object(),
  },

  getReviews: {
    path: "/reviews",
    verb: "GET",
    handler: { controller: adminController, method: "getReviews" },
    request: {},
    response: Joi.object(),
  },

  getNotifications: {
    path: "/notifications",
    verb: "GET",
    handler: { controller: adminController, method: "getNotifications" },
    request: {},
    response: Joi.object(),
  },

  getCategories: {
    path: "/categories",
    verb: "GET",
    handler: { controller: adminController, method: "getCategories" },
    request: {},
    response: Joi.object(),
  },

  getAuditLogs: {
    path: "/audit-logs",
    verb: "GET",
    handler: { controller: adminController, method: "getAuditLogs" },
    request: {},
    response: Joi.object(),
  },
};

export const adminApi = buildApiRouter(apiDefinitions);
