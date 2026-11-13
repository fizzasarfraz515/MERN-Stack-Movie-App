import { IMAGE_BASE_URL } from './constants';

/**
 * Builds a TMDB image URL. Common sizes:
 * posters  w185 | w342 | w500 | w780
 * backdrops w780 | w1280 | original
 * people   w185 | h632
 * Returns null when TMDB has no image so callers can show a fallback.
 */
export function imageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}
