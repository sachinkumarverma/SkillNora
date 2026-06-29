import Joi from 'joi';
import { Router } from 'express';

export const buildApiRouter = (apiDefinitions) => {
    const router = Router();
    
    // We expect apiDefinitions to be an object where keys are route names and values are the definition objects
    for (const [key, obj] of Object.entries(apiDefinitions)) {
        if (!obj.path || !obj.verb || !obj.handler || !obj.handler.controller || !obj.handler.method) {
            console.warn(`Invalid API definition for ${key}`);
            continue;
        }
        
        const method = obj.verb.toLowerCase();
        const middlewares = [];
        
        // Joi validation middleware
        if (obj.request) {
            middlewares.push((req, res, next) => {
                if (obj.request.query) {
                    const { error } = Joi.object(obj.request.query).validate(req.query, { allowUnknown: true });
                    if (error) return res.status(400).json({ error: `Query Validation Error: ${error.details[0].message}` });
                }
                if (obj.request.params) {
                    // Usually we don't strict-validate params unless specified
                    const { error } = Joi.object(obj.request.params).validate(req.params, { allowUnknown: true });
                    if (error) return res.status(400).json({ error: `Params Validation Error: ${error.details[0].message}` });
                }
                if (obj.request.body) {
                    const { error } = Joi.object(obj.request.body).validate(req.body, { allowUnknown: true });
                    if (error) return res.status(400).json({ error: `Body Validation Error: ${error.details[0].message}` });
                }
                next();
            });
        }
        
        // Custom middlewares (if any)
        if (obj.middlewares && Array.isArray(obj.middlewares)) {
            middlewares.push(...obj.middlewares);
        }
        
        // Execute Controller method
        const handler = async (req, res, next) => {
             try {
                await obj.handler.controller[obj.handler.method](req, res);
             } catch (err) {
                 next(err);
             }
        };
        
        middlewares.push(handler);
        
        // Map path format if needed (e.g., Express expects :id, Joi/Sofy might use :UUID, etc. we assume Express syntax like /:id is used)
        router[method](obj.path, ...middlewares);
    }
    
    return router;
};
