import { useEffect, useMemo, useState } from 'react';
import { getGenres } from '../services/movieService';

// Genres almost never change, so fetch them once for the whole session.
let cachedGenres = null;
let pendingRequest = null;

export default function useGenres() {
  const [genres, setGenres] = useState(cachedGenres || []);

  useEffect(() => {
    if (cachedGenres) return undefined;

    if (!pendingRequest) {
      pendingRequest = getGenres()
        .then(({ genres: loaded }) => {
          cachedGenres = loaded;
          return loaded;
        })
        .finally(() => {
          pendingRequest = null;
        });
    }

    let cancelled = false;
    pendingRequest
      .then((loaded) => {
        if (!cancelled) setGenres(loaded);
      })
      .catch(() => {
        /* The UI simply shows no genre chips; the next page visit retries. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const namesById = useMemo(
    () => Object.fromEntries(genres.map((genre) => [genre.id, genre.name])),
    [genres]
  );

  /** Converts [28, 12] into ['Action', 'Adventure']. */
  const getGenreNames = (ids = []) => ids.map((id) => namesById[id]).filter(Boolean);

  return { genres, getGenreNames };
}
