import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/api';

const MAX_TMDB_PAGES = 500;

/**
 * Loads a paginated TMDB list one page at a time.
 *
 * `fetchPage(page)` must resolve to a TMDB list response. Pass `deps` that
 * describe what the list depends on (genre, sort, query...); when they change
 * the list resets and starts again from page 1.
 */
export default function useInfiniteMovies(fetchPage, deps) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lets us ignore responses that arrive after the filters have changed.
  const latestRequest = useRef(0);

  // `fetchPage` is a new function every render, so the caller's `deps` decide
  // when loadPage (and therefore the whole list) should be recreated.
  const loadPage = useCallback(async (pageNumber) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPage(pageNumber);
      if (requestId !== latestRequest.current) return;

      setMovies((previous) => {
        if (pageNumber === 1) return data.results;
        // TMDB occasionally repeats a movie across pages; keep each one once.
        const knownIds = new Set(previous.map((movie) => movie.id));
        return [...previous, ...data.results.filter((movie) => !knownIds.has(movie.id))];
      });
      setPage(pageNumber);
      setTotalPages(Math.min(data.total_pages || 1, MAX_TMDB_PAGES));
      setTotalResults(data.total_results || 0);
    } catch (requestError) {
      if (requestId === latestRequest.current) setError(getErrorMessage(requestError));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Start over whenever the filters change.
  useEffect(() => {
    setMovies([]);
    setPage(0);
    setTotalPages(1);
    setTotalResults(0);
    loadPage(1);
  }, [loadPage]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(() => {
    if (!loading && !error && hasMore) loadPage(page + 1);
  }, [loading, error, hasMore, loadPage, page]);

  // Retry whatever page failed (page 1 if nothing has loaded yet).
  const retry = useCallback(() => loadPage(page + 1), [loadPage, page]);

  return { movies, loading, error, hasMore, totalResults, loadMore, retry };
}
