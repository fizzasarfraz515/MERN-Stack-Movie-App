/**
 * Request body validators. Each one returns a list of human readable
 * problems; an empty list means the body is valid.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIST_TYPES = ['watchlist', 'favorites'];

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

function validateRegister({ name, email, password } = {}) {
  const errors = [];

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
    errors.push('Name must be between 2 and 50 characters');
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.push('Password must contain at least one letter and one number');
  }

  return errors;
}

function validateLogin({ email, password } = {}) {
  const errors = [];

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }
  if (typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  return errors;
}

function validateProfileUpdate({ name } = {}) {
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
    return ['Name must be between 2 and 50 characters'];
  }
  return [];
}

function validateWatchlistItem({ movieId, listType, title } = {}) {
  const errors = [];

  if (!isPositiveInteger(movieId)) errors.push('A valid movieId is required');
  if (!LIST_TYPES.includes(listType)) errors.push('listType must be "watchlist" or "favorites"');
  if (typeof title !== 'string' || title.trim().length === 0) errors.push('Movie title is required');

  return errors;
}

function validateRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
    ? []
    : ['Rating must be a whole number between 1 and 5'];
}

function validateContent(content) {
  if (content === undefined || content === null || content === '') return [];
  if (typeof content !== 'string' || content.length > 2000) {
    return ['Review text must be 2000 characters or fewer'];
  }
  return [];
}

function validateNewReview({ movieId, movieTitle, rating, content } = {}) {
  const errors = [];

  if (!isPositiveInteger(movieId)) errors.push('A valid movieId is required');
  if (typeof movieTitle !== 'string' || movieTitle.trim().length === 0) {
    errors.push('Movie title is required');
  }

  return [...errors, ...validateRating(rating), ...validateContent(content)];
}

function validateReviewUpdate({ rating, content } = {}) {
  return [...validateRating(rating), ...validateContent(content)];
}

module.exports = {
  LIST_TYPES,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateWatchlistItem,
  validateNewReview,
  validateReviewUpdate,
};
