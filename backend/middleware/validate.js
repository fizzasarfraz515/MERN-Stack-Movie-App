const AppError = require('../utils/AppError');

/**
 * Builds a middleware that runs one of the validators from utils/validators.js
 * against req.body and rejects the request with a 400 if anything is wrong.
 */
const validateBody = (validator) => (req, res, next) => {
  const errors = validator(req.body);

  if (errors.length > 0) {
    return next(new AppError(errors.join('. '), 400, errors));
  }
  return next();
};

module.exports = validateBody;
