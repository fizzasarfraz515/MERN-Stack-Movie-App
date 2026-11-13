import api from './api';

const unwrap = (response) => response.data;

export const getCategory = (category, page = 1) =>
  api.get(`/movies/category/${category}`, { params: { page } }).then(unwrap);

export const getGenres = () => api.get('/movies/genres').then(unwrap);

export const discoverMovies = ({ page = 1, genre, sort }) =>
  api.get('/movies/discover', { params: { page, genre, sort } }).then(unwrap);

export const searchMovies = (query, page = 1) =>
  api.get('/movies/search', { params: { q: query, page } }).then(unwrap);

export const getSuggestions = (query, signal) =>
  api.get('/movies/suggestions', { params: { q: query }, signal }).then(unwrap);

export const getMovieDetails = (movieId) => api.get(`/movies/${movieId}`).then(unwrap);
