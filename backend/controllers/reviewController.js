const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { getMovieRatingStats } = require('../services/reviewService');

const REVIEWS_PER_PAGE = 8;

/** Loads a review and makes sure the logged-in user owns it. */
async function findOwnedReview(reviewId, userId) {
  const review = await Review.findById(reviewId);

  if (!review) throw new AppError('Review not found', 404);
  if (!review.user.equals(userId)) {
    throw new AppError('You can only change your own reviews', 403);
  }
  return review;
}

// GET /api/reviews/movie/:movieId?page=   (public)
const getMovieReviews = asyncHandler(async (req, res) => {
  const movieId = Number(req.params.movieId);
  if (!Number.isInteger(movieId) || movieId <= 0) throw new AppError('Invalid movie id', 400);

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const [reviews, stats] = await Promise.all([
    Review.find({ movieId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * REVIEWS_PER_PAGE)
      .limit(REVIEWS_PER_PAGE)
      .populate('user', 'name'),
    getMovieRatingStats(movieId),
  ]);

  res.json({
    reviews,
    stats,
    page,
    totalPages: Math.max(Math.ceil(stats.count / REVIEWS_PER_PAGE), 1),
  });
});

// GET /api/reviews/movie/:movieId/mine
const getMyReviewForMovie = asyncHandler(async (req, res) => {
  const movieId = Number(req.params.movieId);
  const review = await Review.findOne({ user: req.user._id, movieId }).populate('user', 'name');

  res.json({ review });
});

// GET /api/reviews/mine
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .sort({ updatedAt: -1 })
    .populate('user', 'name');

  res.json({ reviews });
});

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { movieId, movieTitle, moviePosterPath, rating, content } = req.body;

  const existing = await Review.exists({ user: req.user._id, movieId });
  if (existing) {
    throw new AppError('You have already reviewed this movie. Edit your review instead', 409);
  }

  const review = await Review.create({
    user: req.user._id,
    movieId,
    movieTitle,
    moviePosterPath,
    rating,
    content,
  });
  await review.populate('user', 'name');

  res.status(201).json({ review });
});

// PUT /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const review = await findOwnedReview(req.params.id, req.user._id);

  review.rating = req.body.rating;
  review.content = req.body.content || '';
  await review.save();
  await review.populate('user', 'name');

  res.json({ review });
});

// DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await findOwnedReview(req.params.id, req.user._id);
  await review.deleteOne();

  res.json({ id: review._id });
});

module.exports = {
  getMovieReviews,
  getMyReviewForMovie,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
