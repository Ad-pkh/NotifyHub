import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { apiKeyMiddleware } from '../../middleware/apiKey.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { publishEventSchema } from '../../lib/schemas/event.schema.js';
import * as eventController from './event.controller.js';

const router = Router();

router.post('/v1/events', apiKeyMiddleware, validate(publishEventSchema), eventController.publish);
router.get('/events', authMiddleware, eventController.list);
router.get('/events/:id', authMiddleware, eventController.getById);
router.post('/events/:id/retry', authMiddleware, eventController.retry);

export default router;
