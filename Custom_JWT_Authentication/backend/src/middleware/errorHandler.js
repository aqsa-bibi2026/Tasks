export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  console.error('BACKEND ERROR:', err);

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && isProduction
        ? 'Internal server error.'
        : err.message || 'Internal server error.'
  });
}
