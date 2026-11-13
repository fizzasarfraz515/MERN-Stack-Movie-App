const tmdb = require('../services/tmdbService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const SORT_OPTIONS = ['popularity.desc', 'vote_average.desc', 'primary_release_date.desc'];
const MAX_TMDB_PAGE = 500; // TMDB refuses anything higher

/** Clamp the page query parameter to something TMDB accepts. */
const parsePage = (value) => Math.min(Math.max(parseInt(value, 10) || 1, 1), MAX_TMDB_PAGE);

const parseMovieId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Invalid movie id', 400);
  return id;
};

const requireSearchQuery = (value) => {
  const query = typeof value === 'string' ? value.trim() : '';
  if (!query) throw new AppError('A search query is required', 400);
  return query;
};

// GET /api/movies/category/:category?page=
const getCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  if (!Object.keys(tmdb.CATEGORY_ENDPOINTS).includes(category)) {
    throw new AppError(`Unknown category "${category}"`, 400);
  }

  res.json(await tmdb.getCategory(category, parsePage(req.query.page)));
});

// GET /api/movies/genres
const getGenres = asyncHandler(async (req, res) => {
  res.json({ genres: await tmdb.getGenres() });
});

// GET /api/movies/discover?page=&genre=&sort=
const discoverMovies = asyncHandler(async (req, res) => {
  const { genre, sort } = req.query;

  if (sort && !SORT_OPTIONS.includes(sort)) {
    throw new AppError('Unsupported sort option', 400);
  }
  if (genre && !/^\d+(,\d+)*$/.test(genre)) {
    throw new AppError('Invalid genre', 400);
  }

  res.json(await tmdb.discover({ page: parsePage(req.query.page), genre, sort }));
});

// GET /api/movies/search?q=&page=
const searchMovies = asyncHandler(async (req, res) => {
  const query = requireSearchQuery(req.query.q);
  res.json(await tmdb.searchMovies(query, parsePage(req.query.page)));
});

// GET /api/movies/suggestions?q=
const getSuggestions = asyncHandler(async (req, res) => {
  const query = requireSearchQuery(req.query.q);
  res.json({ suggestions: await tmdb.getSuggestions(query) });
});

// GET /api/movies/:id
const getMovieDetails = asyncHandler(async (req, res) => {
  res.json(await tmdb.getMovieDetails(parseMovieId(req.params.id)));
});

module.exports = {
  getCategory,
  getGenres,
  discoverMovies,
  searchMovies,
  getSuggestions,
  getMovieDetails,
};
