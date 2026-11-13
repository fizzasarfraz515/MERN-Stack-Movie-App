import api from './api';

const unwrap = (response) => response.data;

export const getProfile = () => api.get('/users/profile').then(unwrap);

export const updateProfile = (name) => api.put('/users/profile', { name }).then(unwrap);

export const addRecentlyViewed = (movie) =>
  api.post('/users/recently-viewed', {
    movieId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
  });
