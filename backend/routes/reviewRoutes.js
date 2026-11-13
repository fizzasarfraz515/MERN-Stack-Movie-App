const express = require('express');
const {
  getMovieReviews,
  getMyReviewForMovie,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validateBody = require('../middleware/validate');
const { validateNewReview, validateReviewUpdate } = require('../utils/validators');

const router = express.Router();

// Public: anyone can read the reviews for a movie.
router.get('/movie/:movieId', getMovieReviews);

// Everything below needs a logged-in user.
router.get('/movie/:movieId/mine', protect, getMyReviewForMovie);
router.get('/mine', protect, getMyReviews);
router.post('/', protect, validateBody(validateNewReview), createReview);
router.put('/:id', protect, validateBody(validateReviewUpdate), updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
