import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as watchlistService from '../services/watchlistService';
import { getErrorMessage } from '../services/api';
import { LIST_LABELS, LIST_TYPES } from '../utils/constants';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WatchlistContext = createContext(null);

const EMPTY_LISTS = { [LIST_TYPES.WATCHLIST]: [], [LIST_TYPES.FAVORITES]: [] };

const requestKey = (listType, movieId) => `${listType}:${movieId}`;

/**
 * Holds the logged-in user's watchlist and favorites so every MovieCard and
 * button on the site can show the right state without its own request.
 */
export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [lists, setLists] = useState(EMPTY_LISTS);
  const [loading, setLoading] = useState(false);
  const [pendingKeys, setPendingKeys] = useState(() => new Set());

  const userId = user?._id;

  // Load the saved movies on login, and clear them on logout.
  useEffect(() => {
    if (!userId) {
      setLists(EMPTY_LISTS);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    watchlistService
      .getSavedMovies()
      .then(({ items }) => {
        if (cancelled) return;
        setLists({
          [LIST_TYPES.WATCHLIST]: items.filter((item) => item.listType === LIST_TYPES.WATCHLIST),
          [LIST_TYPES.FAVORITES]: items.filter((item) => item.listType === LIST_TYPES.FAVORITES),
        });
      })
      .catch((error) => {
        if (!cancelled) toast.error(getErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, toast]);

  const isSaved = useCallback(
    (listType, movieId) => lists[listType].some((item) => item.movieId === movieId),
    [lists]
  );

  const isPending = useCallback(
    (listType, movieId) => pendingKeys.has(requestKey(listType, movieId)),
    [pendingKeys]
  );

  const setPending = (key, isPendingNow) => {
    setPendingKeys((current) => {
      const next = new Set(current);
      if (isPendingNow) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  /**
   * Adds the movie to the list, or removes it if it is already there.
   * `movie` uses TMDB's field names (id, title, poster_path, ...).
   */
  const toggle = useCallback(
    async (listType, movie) => {
      if (!user) {
        toast.info('Log in to save movies to your lists.');
        navigate('/login', { state: { from: location } });
        return;
      }

      const key = requestKey(listType, movie.id);
      if (pendingKeys.has(key)) return;

      const alreadySaved = lists[listType].some((item) => item.movieId === movie.id);
      setPending(key, true);

      try {
        if (alreadySaved) {
          await watchlistService.removeSavedMovie(movie.id, listType);
          setLists((current) => ({
            ...current,
            [listType]: current[listType].filter((item) => item.movieId !== movie.id),
          }));
          toast.success(`Removed "${movie.title}" from your ${LIST_LABELS[listType]}.`);
        } else {
          const { item } = await watchlistService.addSavedMovie({
            movieId: movie.id,
            listType,
            title: movie.title,
            posterPath: movie.poster_path || null,
            releaseDate: movie.release_date || '',
            voteAverage: movie.vote_average || 0,
          });
          setLists((current) => ({ ...current, [listType]: [item, ...current[listType]] }));
          toast.success(`Added "${movie.title}" to your ${LIST_LABELS[listType]}.`);
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPending(key, false);
      }
    },
    [user, lists, pendingKeys, toast, navigate, location]
  );

  const value = useMemo(
    () => ({ lists, loading, isSaved, isPending, toggle }),
    [lists, loading, isSaved, isPending, toggle]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used inside <WatchlistProvider>');
  return context;
}
