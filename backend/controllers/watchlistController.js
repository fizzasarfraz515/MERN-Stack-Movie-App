const Watchlist = require('../models/Watchlist');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { LIST_TYPES } = require('../utils/validators');

// GET /api/watchlist?listType=watchlist|favorites   (omit to get both)
const getItems = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };

  if (req.query.listType) {
    if (!LIST_TYPES.includes(req.query.listType)) {
      throw new AppError('listType must be "watchlist" or "favorites"', 400);
    }
    filter.listType = req.query.listType;
  }

  const items = await Watchlist.find(filter).sort({ createdAt: -1 });
  res.json({ items });
});

// POST /api/watchlist
const addItem = asyncHandler(async (req, res) => {
  const { movieId, listType, title, posterPath, releaseDate, voteAverage } = req.body;

  const alreadySaved = await Watchlist.exists({ user: req.user._id, movieId, listType });
  if (alreadySaved) {
    throw new AppError(`"${title}" is already in your ${listType}`, 409);
  }

  const item = await Watchlist.create({
    user: req.user._id,
    movieId,
    listType,
    title,
    posterPath,
    releaseDate,
    voteAverage,
  });

  res.status(201).json({ item });
});

// DELETE /api/watchlist/:movieId?listType=watchlist|favorites
const removeItem = asyncHandler(async (req, res) => {
  const movieId = Number(req.params.movieId);
  const { listType } = req.query;

  if (!Number.isInteger(movieId) || !LIST_TYPES.includes(listType)) {
    throw new AppError('A valid movie id and listType are required', 400);
  }

  const removed = await Watchlist.findOneAndDelete({ user: req.user._id, movieId, listType });
  if (!removed) {
    throw new AppError('That movie is not in your list', 404);
  }

  res.json({ movieId, listType });
});

module.exports = { getItems, addItem, removeItem };
