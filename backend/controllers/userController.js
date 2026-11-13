const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { getUserRatingStats } = require('../services/reviewService');

// GET /api/users/profile  -> profile + dashboard statistics
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [watchlistCount, favoritesCount, ratingStats] = await Promise.all([
    Watchlist.countDocuments({ user: userId, listType: 'watchlist' }),
    Watchlist.countDocuments({ user: userId, listType: 'favorites' }),
    getUserRatingStats(userId),
  ]);

  res.json({
    user: req.user,
    stats: {
      watchlist: watchlistCount,
      favorites: favoritesCount,
      reviews: ratingStats.count,
      averageRating: ratingStats.average,
    },
  });
});

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  req.user.name = req.body.name.trim();
  await req.user.save();

  res.json({ user: req.user });
});

// POST /api/users/recently-viewed
const addRecentlyViewed = asyncHandler(async (req, res) => {
  const { movieId, title, posterPath } = req.body;

  if (!Number.isInteger(movieId) || movieId <= 0 || typeof title !== 'string' || !title.trim()) {
    throw new AppError('movieId and title are required', 400);
  }

  // Remove any older entry for the same movie, then put it back on top.
  // Done as two atomic updates so concurrent requests cannot corrupt the list.
  await User.updateOne({ _id: req.user._id }, { $pull: { recentlyViewed: { movieId } } });
  await User.updateOne(
    { _id: req.user._id },
    {
      $push: {
        recentlyViewed: {
          $each: [{ movieId, title: title.trim(), posterPath: posterPath || null }],
          $position: 0,
          $slice: User.MAX_RECENTLY_VIEWED,
        },
      },
    }
  );

  res.status(204).end();
});

module.exports = { getProfile, updateProfile, addRecentlyViewed };
