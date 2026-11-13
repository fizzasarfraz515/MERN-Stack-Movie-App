/**
 * Saved movies (watchlist, favorites, recently viewed) are stored with our own
 * field names. Cards and the watchlist toggle expect TMDB's shape, so this
 * converts one into the other.
 */
export function savedToMovie(saved) {
  return {
    id: saved.movieId,
    title: saved.title,
    poster_path: saved.posterPath,
    release_date: saved.releaseDate || '',
    vote_average: saved.voteAverage || 0,
  };
}

export function reviewToMovie(review) {
  return {
    id: review.movieId,
    title: review.movieTitle,
    poster_path: review.moviePosterPath,
  };
}
