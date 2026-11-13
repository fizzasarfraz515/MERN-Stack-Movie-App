import api from './api';

const unwrap = (response) => response.data;

export const getMovieReviews = (movieId, page = 1) =>
  api.get(`/reviews/movie/${movieId}`, { params: { page } }).then(unwrap);

export const getMyReviewForMovie = (movieId) =>
  api.get(`/reviews/movie/${movieId}/mine`).then(unwrap);

export const getMyReviews = () => api.get('/reviews/mine').then(unwrap);

export const createReview = (payload) => api.post('/reviews', payload).then(unwrap);

export const updateReview = (reviewId, payload) =>
  api.put(`/reviews/${reviewId}`, payload).then(unwrap);

export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`).then(unwrap);
