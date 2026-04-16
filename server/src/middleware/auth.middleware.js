import { verifyToken } from '../lib/jwt.js';
import AppError from '../lib/AppError.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError('Unauthorized', 401);
    }

    const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    req.tenant = decoded;
    next();
  } catch (_err) {
    next(new AppError('Unauthorized', 401));
  }
};
