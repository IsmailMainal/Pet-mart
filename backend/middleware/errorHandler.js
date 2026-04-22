const errorHandler = (err, req, res, next) => {
  console.error('💥 ERROR:', err);

  // Zod Validation Errors
  if (err.name === 'ZodError') {
    console.error('Validation Error Details:', JSON.stringify(err.errors, null, 2));
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Sequelize Unique Constraint Errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Duplicate entry',
      message: err.errors.map(e => e.message).join(', ')
    });
  }

  // Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.errors.map(e => e.message).join(', ')
    });
  }
  // Multer & Upload Errors
  if (err.name === 'MulterError' || err.message?.includes('allowed') || err.message?.includes('storage')) {
    return res.status(400).json({
      error: 'Upload failed',
      message: err.message || 'Image storage error. Check folder permissions.'
    });
  }

  // Default Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Server Error' : 'Error',
    message: message
  });
};

module.exports = errorHandler;
