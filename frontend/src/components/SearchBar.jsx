import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Loader2, Search, X } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import { getSuggestions } from '../services/movieService';
import { imageUrl } from '../utils/image';
import { formatScore } from '../utils/format';

const MIN_QUERY_LENGTH = 2;

/**
 * Search box with debounced, keyboard-navigable suggestions.
 * Enter on plain text opens the full results on the Explore page.
 */
export default function SearchBar({ autoFocus = false, onNavigate, className = '' }) {
  const navigate = useNavigate();
  const listId = useId();
  const containerRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [highlighted, setHighlighted] = useState(-1);

  const debouncedQuery = useDebounce(query.trim(), 350);
  const hasQuery = debouncedQuery.length >= MIN_QUERY_LENGTH;

  // Fetch suggestions when the (debounced) text changes.
  useEffect(() => {
    if (!hasQuery) {
      setSuggestions([]);
      setStatus('idle');
      return undefined;
    }

    const controller = new AbortController();
    setStatus('loading');

    getSuggestions(debouncedQuery, controller.signal)
      .then(({ suggestions: results }) => {
        setSuggestions(results);
        setHighlighted(-1);
        setStatus('done');
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') setStatus('error');
      });

    // Cancels the request if the user keeps typing.
    return () => controller.abort();
  }, [debouncedQuery, hasQuery]);

  // Close the dropdown when clicking elsewhere.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const finish = (path) => {
    setOpen(false);
    setQuery('');
    setSuggestions([]);
    onNavigate?.();
    navigate(path);
  };

  const submitSearch = () => {
    const text = query.trim();
    if (text) finish(`/explore?q=${encodeURIComponent(text)}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => Math.min(current + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, -1));
    } else if (event.key === 'Escape') {
      setOpen(false);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const picked = suggestions[highlighted];
      if (picked) finish(`/movie/${picked.id}`);
      else submitSearch();
    }
  };

  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search movies..."
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-full border border-white/10 bg-surface/80 py-2.5 pl-11 pr-10 text-sm text-cream placeholder:text-muted backdrop-blur transition focus:border-gold/70 focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setSuggestions([]);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-cream"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface-raised shadow-2xl"
        >
          {status === 'loading' && (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching...
            </div>
          )}

          {status === 'error' && (
            <p className="px-4 py-4 text-sm text-red-300">
              Search is unavailable right now. Please try again.
            </p>
          )}

          {status === 'done' && suggestions.length === 0 && (
            <p className="px-4 py-4 text-sm text-muted">
              No movies match &ldquo;{debouncedQuery}&rdquo;.
            </p>
          )}

          {status === 'done' &&
            suggestions.map((movie, index) => {
              const poster = imageUrl(movie.poster_path, 'w92');
              return (
                <button
                  key={movie.id}
                  type="button"
                  role="option"
                  aria-selected={index === highlighted}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => finish(`/movie/${movie.id}`)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                    index === highlighted ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  {poster ? (
                    <img src={poster} alt="" className="h-14 w-10 rounded object-cover" />
                  ) : (
                    <div className="flex h-14 w-10 items-center justify-center rounded bg-surface text-muted">
                      <Film className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{movie.title}</p>
                    <p className="text-xs text-muted">
                      {movie.year || 'Unknown year'}
                      {formatScore(movie.vote_average) && ` · ★ ${formatScore(movie.vote_average)}`}
                    </p>
                  </div>
                </button>
              );
            })}

          {status === 'done' && suggestions.length > 0 && (
            <button
              type="button"
              onClick={submitSearch}
              className="w-full border-t border-white/10 px-4 py-3 text-left text-sm font-medium text-gold transition hover:bg-white/5"
            >
              See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
