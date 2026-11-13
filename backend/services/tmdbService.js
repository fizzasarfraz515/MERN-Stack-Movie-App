const axios = require('axios');
const cache = require('../utils/cache');
const AppError = require('../utils/AppError');
const { tmdbApiKey } = require('../config/env');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// How long (in seconds) each kind of response may be served from cache.
const TTL = { lists: 600, details: 1800, genres: 86400, search: 300 };

const CATEGORY_ENDPOINTS = {
  trending: '/trending/movie/week',
  popular: '/movie/popular',
  top_rated: '/movie/top_rated',
  upcoming: '/movie/upcoming',
  now_playing: '/movie/now_playing',
};

const http = axios.create({ baseURL: TMDB_BASE_URL, timeout: 10000 });

/**
 * TMDB issues two kinds of credentials: a short v3 "API key" (sent as a query
 * parameter) and a long v4 "Read Access Token" (sent as a Bearer header).
 * Supporting both means either one works in TMDB_API_KEY.
 */
function buildAuth() {
  const credential = tmdbApiKey;
  return credential.length > 40
    ? { headers: { Authorization: `Bearer ${credential}` }, params: {} }
    : { headers: {}, params: { api_key: credential } };
}

/** Translate a failed TMDB call into an error our API can return. */
function toAppError(error) {
  const status = error.response && error.response.status;

  if (status === 404) return new AppError('Movie not found', 404);
  if (status === 401) {
    return new AppError('TMDB rejected the API key. Check TMDB_API_KEY in backend/.env', 502);
  }
  if (status === 429) return new AppError('Too many requests to TMDB. Try again shortly', 503);
  return new AppError('The movie service is temporarily unavailable', 502);
}

/** Single place that talks to TMDB. Results are cached by URL + params. */
async function request(path, params = {}, ttlSeconds = TTL.lists) {
  const cacheKey = `${path}?${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const auth = buildAuth();

  try {
    const { data } = await http.get(path, {
      headers: auth.headers,
      params: { ...auth.params, language: 'en-US', ...params },
    });
    cache.set(cacheKey, data, ttlSeconds);
    return data;
  } catch (error) {
    throw toAppError(error);
  }
}

/** trending | popular | top_rated | upcoming | now_playing */
function getCategory(category, page = 1) {
  return request(CATEGORY_ENDPOINTS[category], { page });
}

async function getGenres() {
  const data = await request('/genre/movie/list', {}, TTL.genres);
  return data.genres;
}

/** Browse movies with an optional genre filter and sort order. */
function discover({ page = 1, genre, sort = 'popularity.desc' }) {
  const params = { page, sort_by: sort, include_adult: false };

  if (genre) params.with_genres = genre;

  // Without a vote floor, "top rated" is flooded by obscure 10/10 films.
  if (sort.startsWith('vote_average')) params['vote_count.gte'] = 300;

  // "Newest first" should start from today, not from unreleased titles.
  if (sort.startsWith('primary_release_date')) {
    params['primary_release_date.lte'] = new Date().toISOString().slice(0, 10);
    params['vote_count.gte'] = 5;
  }

  return request('/discover/movie', params);
}

function searchMovies(query, page = 1) {
  return request('/search/movie', { query, page, include_adult: false }, TTL.search);
}

/** A short list for the search-as-you-type dropdown. */
async function getSuggestions(query) {
  const data = await searchMovies(query, 1);

  return data.results.slice(0, 6).map((movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? movie.release_date.slice(0, 4) : '',
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
  }));
}

const KEY_CREW_JOBS = ['Director', 'Screenplay', 'Writer', 'Story', 'Producer'];

/**
 * Full movie page in one TMDB call (append_to_response), reshaped into
 * exactly what the frontend needs.
 */
async function getMovieDetails(movieId) {
  const movie = await request(
    `/movie/${movieId}`,
    { append_to_response: 'credits,videos,similar' },
    TTL.details
  );

  const { credits, videos, similar, ...details } = movie;

  // Prefer an official YouTube trailer, then any trailer, then any video.
  const youtubeVideos = (videos.results || []).filter((video) => video.site === 'YouTube');
  const trailer =
    youtubeVideos.find((video) => video.type === 'Trailer' && video.official) ||
    youtubeVideos.find((video) => video.type === 'Trailer') ||
    youtubeVideos.find((video) => video.type === 'Teaser') ||
    null;

  // One entry per person, keeping every key job they held.
  const crewByPerson = new Map();
  credits.crew
    .filter((member) => KEY_CREW_JOBS.includes(member.job))
    .forEach((member) => {
      const existing = crewByPerson.get(member.id);
      if (existing) {
        if (!existing.jobs.includes(member.job)) existing.jobs.push(member.job);
      } else {
        crewByPerson.set(member.id, {
          id: member.id,
          name: member.name,
          profile_path: member.profile_path,
          jobs: [member.job],
        });
      }
    });

  return {
    ...details,
    trailer: trailer ? { key: trailer.key, name: trailer.name } : null,
    cast: credits.cast.slice(0, 15),
    crew: Array.from(crewByPerson.values()).slice(0, 8),
    similar: (similar.results || []).filter((item) => item.poster_path).slice(0, 15),
  };
}

module.exports = {
  CATEGORY_ENDPOINTS,
  getCategory,
  getGenres,
  discover,
  searchMovies,
  getSuggestions,
  getMovieDetails,
};
