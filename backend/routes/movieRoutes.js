const express = require('express');
const {
  getCategory,
  getGenres,
  discoverMovies,
  searchMovies,
  getSuggestions,
  getMovieDetails,
} = require('../controllers/movieController');

const router = express.Router();

// Fixed paths must come before "/:id" so they are not mistaken for an id.
router.get('/category/:category', getCategory);
router.get('/genres', getGenres);
router.get('/discover', discoverMovies);
router.get('/search', searchMovies);
router.get('/suggestions', getSuggestions);
router.get('/:id', getMovieDetails);

module.exports = router;
