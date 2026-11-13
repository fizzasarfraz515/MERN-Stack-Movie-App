import api from './api';

const unwrap = (response) => response.data;

export const getSavedMovies = () => api.get('/watchlist').then(unwrap);

export const addSavedMovie = (payload) => api.post('/watchlist', payload).then(unwrap);

export const removeSavedMovie = (movieId, listType) =>
  api.delete(`/watchlist/${movieId}`, { params: { listType } }).then(unwrap);
