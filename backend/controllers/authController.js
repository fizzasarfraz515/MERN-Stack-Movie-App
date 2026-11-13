const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const emailTaken = await User.exists({ email: email.trim().toLowerCase() });
  if (emailTaken) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({ user, token: generateToken(user._id) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password is `select: false`, so it has to be requested explicitly.
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  // Same message for "no such user" and "wrong password" so the API does
  // not reveal which emails are registered.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({ user, token: generateToken(user._id) });
});

// GET /api/auth/me
const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getCurrentUser };
