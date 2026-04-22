const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    console.error('[DEBUG] Validation failed for route:', req.originalUrl, err.errors);
    next(err);
  }
};

module.exports = validate;
