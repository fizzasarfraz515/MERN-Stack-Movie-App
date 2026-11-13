export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const IMAGE_BASE_URL =
  import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export const TOKEN_STORAGE_KEY = 'cineverse_token';
export const AUTH_EXPIRED_EVENT = 'cineverse:auth-expired';

export const LIST_TYPES = {
  WATCHLIST: 'watchlist',
  FAVORITES: 'favorites',
};

export const LIST_LABELS = {
  watchlist: 'watchlist',
  favorites: 'favorites',
};

// Keys match the backend's /movies/category/:category route.
export const CATEGORIES = [
  { key: 'trending', label: 'Trending' },
  { key: 'popular', label: 'Popular' },
  { key: 'top_rated', label: 'Top Rated' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'now_playing', label: 'Now Playing' },
];

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'primary_release_date.desc', label: 'Newest first' },
];

export const DEFAULT_SORT = SORT_OPTIONS[0].value;
