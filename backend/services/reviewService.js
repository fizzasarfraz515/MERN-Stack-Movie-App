const mongoose = require('mongoose');
const Review = require('../models/Review');

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

/** Community average + review count for one movie. */
async function getMovieRatingStats(movieId) {
  const [stats] = await Review.aggregate([
    { $match: { movieId } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  return stats
    ? { average: roundToOneDecimal(stats.average), count: stats.count }
    : { average: 0, count: 0 };
}

/** How many movies a user has rated and their average score. */
async function getUserRatingStats(userId) {
  const [stats] = await Review.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  return stats
    ? { average: roundToOneDecimal(stats.average), count: stats.count }
    : { average: 0, count: 0 };
}

module.exports = { getMovieRatingStats, getUserRatingStats };
