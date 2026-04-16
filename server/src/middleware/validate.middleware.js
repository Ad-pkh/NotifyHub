import AppError from '../lib/AppError.js';

export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return next(new AppError('Validation failed', 400, parsed.error.format()));
  }

  req.body = parsed.data;
  next();
};
