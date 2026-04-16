import bcrypt from 'bcryptjs';
import Tenant from '../modules/auth/auth.model.js';
import AppError from '../lib/AppError.js';

export const apiKeyMiddleware = async (req, res, next) => {
  try {
    const rawApiKey = req.header('X-API-Key');
    if (!rawApiKey) {
      throw new AppError('Unauthorized', 401);
    }

    const [apiKeyId] = rawApiKey.split('.', 1);
    if (!apiKeyId || !rawApiKey.includes('.')) {
      throw new AppError('Unauthorized', 401);
    }

    const tenant = await Tenant.findOne({
      apiKeyId,
      apiKeyHash: { $exists: true, $ne: null },
    });

    if (!tenant?.apiKeyHash) {
      throw new AppError('Unauthorized', 401);
    }

    const isMatch = await bcrypt.compare(rawApiKey, tenant.apiKeyHash);
    if (!isMatch) {
      throw new AppError('Unauthorized', 401);
    }

    req.tenant = tenant;
    return next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Unauthorized', 401));
  }
};
