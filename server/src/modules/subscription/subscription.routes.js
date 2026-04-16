import { Router } from 'express';
import * as subscriptionController from './subscription.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createSubscriptionSchema } from '../../lib/schemas/subscription.schema.js';

const router = Router();

router.use(authMiddleware);

router.get('/', subscriptionController.list);
router.post('/', validate(createSubscriptionSchema), subscriptionController.create);
router.get('/:id', subscriptionController.getById);
router.put('/:id', validate(createSubscriptionSchema), subscriptionController.update);
router.delete('/:id', subscriptionController.remove);
router.patch('/:id/toggle', subscriptionController.toggle);

export default router;
