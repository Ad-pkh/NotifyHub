import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import * as statsController from './stats.controller.js';

const router = Router();

router.get('/overview', authMiddleware, statsController.overview);

export default router;
