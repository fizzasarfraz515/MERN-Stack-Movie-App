const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each validator returns an object like { email: 'message' }. Empty = valid.

export function validateLoginForm({ email, password }) {
  const errors = {};

  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Enter your password';

  return errors;
}

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = {};

  if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address';

  if (password.length < 8) {
    errors.password = 'Use at least 8 characters';
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Include at least one letter and one number';
  }

  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';

  return errors;
}
