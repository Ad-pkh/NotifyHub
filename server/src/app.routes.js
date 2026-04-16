import authRoutes from './modules/auth/auth.routes.js';
import subscriptionRoutes from './modules/subscription/subscription.routes.js';
import eventRoutes from './modules/event/event.routes.js';
import statsRoutes from './modules/stats/stats.routes.js';

export default function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api', eventRoutes);
  app.use('/api/stats', statsRoutes);
}
