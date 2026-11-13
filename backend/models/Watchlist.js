const mongoose = require('mongoose');

/**
 * One document per saved movie. `listType` lets the same collection power
 * both the watchlist and the favorites list. The compound unique index is
 * what prevents duplicate entries.
 */
const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    movieId: { type: Number, required: true },
    listType: { type: String, enum: ['watchlist', 'favorites'], required: true },

    // Movie snapshot used to render cards without extra TMDB calls.
    title: { type: String, required: true, trim: true },
    posterPath: { type: String, default: null },
    releaseDate: { type: String, default: '' },
    voteAverage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

watchlistSchema.index({ user: 1, movieId: 1, listType: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
