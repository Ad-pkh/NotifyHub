export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const responseBody = {
    success: false,
    message,
    statusCode,
  };

  if (err.details) {
    responseBody.errors = err.details;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json(responseBody);
};
