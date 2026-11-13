const mongoose = require('mongoose');

/**
 * A review combines a star rating (1-5) with optional text, so the separate
 * "Rating" model is not needed. A user can only review a movie once.
 */
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movieId: { type: Number, required: true, index: true },

    // Snapshot for the "my reviews" dashboard tab.
    movieTitle: { type: String, required: true, trim: true },
    moviePosterPath: { type: String, default: null },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be higher than 5'],
      validate: { validator: Number.isInteger, message: 'Rating must be a whole number' },
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review text must be 2000 characters or fewer'],
      default: '',
    },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
