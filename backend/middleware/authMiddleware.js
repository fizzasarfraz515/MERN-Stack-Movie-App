const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Requires a valid "Authorization: Bearer <token>" header and attaches
 * the matching user document to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw new AppError('You need to log in to do that', 401);
  }

  let payload;
  try {
    payload = jwt.verify(header.split(' ')[1], jwtSecret);
  } catch {
    throw new AppError('Your session has expired. Please log in again', 401);
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError('This account no longer exists', 401);
  }

  req.user = user;
  next();
});

module.exports = { protect };
