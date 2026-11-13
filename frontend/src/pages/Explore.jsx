import { useSearchParams } from 'react-router-dom';
import { SearchX, X } from 'lucide-react';
import MovieGrid from '../components/MovieGrid';
import GenreFilter from '../components/GenreFilter';
import { EmptyState, ErrorState } from '../components/StateMessages';
import useGenres from '../hooks/useGenres';
import useInfiniteMovies from '../hooks/useInfiniteMovies';
import useIntersection from '../hooks/useIntersection';
import { discoverMovies, getCategory, searchMovies } from '../services/movieService';
import { CATEGORIES, DEFAULT_SORT, SORT_OPTIONS } from '../utils/constants';

/**
 * One page, three ways to browse, chosen by the URL:
 *   ?q=batman             search results (genre filter applies to what was found)
 *   ?category=top_rated   one of TMDB's curated lists (the "View all" links)
 *   (neither)             discover, filtered by ?genre= and ?sort=
 * Keeping everything in the URL makes every view shareable and back-button friendly.
 */
export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { genres } = useGenres();

  const query = searchParams.get('q')?.trim() || '';
  const requestedCategory = searchParams.get('category');
  const category = CATEGORIES.some((item) => item.key === requestedCategory)
    ? requestedCategory
    : '';
  const genreId = Number(searchParams.get('genre')) || null;
  const requestedSort = searchParams.get('sort');
  const sort = SORT_OPTIONS.some((item) => item.value === requestedSort)
    ? requestedSort
    : DEFAULT_SORT;

  const mode = query ? 'search' : category ? 'category' : 'discover';

  const fetchPage = (page) => {
    if (mode === 'search') return searchMovies(query, page);
    if (mode === 'category') return getCategory(category, page);
    return discoverMovies({ page, genre: genreId, sort });
  };

  // The list restarts whenever one of these changes. In search mode TMDB can't
  // filter by genre, so genre and sort are left out and applied below instead.
  const { movies, loading, error, hasMore, totalResults, loadMore, retry } = useInfiniteMovies(
    fetchPage,
    [
      mode,
      query,
      category,
      mode === 'discover' ? genreId : null,
      mode === 'discover' ? sort : null,
    ]
  );

  const sentinelRef = useIntersection(loadMore, { enabled: hasMore && !loading && !error });

  const visibleMovies =
    mode === 'search' && genreId
      ? movies.filter((movie) => movie.genre_ids?.includes(genreId))
      : movies;

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  const heading =
    mode === 'search'
      ? `Results for “${query}”`
      : mode === 'category'
        ? CATEGORIES.find((item) => item.key === category).label
        : 'Explore movies';

  const showGenreFilter = mode !== 'category' && genres.length > 0;
  const isInitialLoad = loading && movies.length === 0;

  return (
    <div className="container-page pb-8 pt-28 sm:pt-32">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold sm:text-5xl">{heading}</h1>
        {!isInitialLoad && !error && totalResults > 0 && (
          <p className="mt-2 text-sm text-muted">{totalResults.toLocaleString()} movies</p>
        )}
      </header>

      {/* Browse mode tabs */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[{ key: '', label: 'Discover' }, ...CATEGORIES].map((tab) => {
          const active = mode !== 'search' && category === tab.key;
          return (
            <button
              key={tab.key || 'discover'}
              type="button"
              onClick={() => updateParams({ category: tab.key, q: null, genre: null, sort: null })}
              aria-pressed={active}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-cream text-ink'
                  : 'border border-white/10 text-cream/80 hover:border-white/30'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {mode === 'search' && (
          <button
            type="button"
            onClick={() => updateParams({ q: null })}
            className="flex shrink-0 items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink"
          >
            Search: {query}
            <X className="h-4 w-4" aria-label="Clear search" />
          </button>
        )}
      </div>

      {/* Genre + sort */}
      {(showGenreFilter || mode === 'discover') && (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {showGenreFilter && (
            <div className="min-w-0 flex-1">
              <GenreFilter
                genres={genres}
                selectedId={genreId}
                onSelect={(id) => updateParams({ genre: id })}
              />
            </div>
          )}

          {mode === 'discover' && (
            <div className="shrink-0">
              <label htmlFor="sort" className="sr-only">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) =>
                  updateParams({ sort: event.target.value === DEFAULT_SORT ? null : event.target.value })
                }
                className="input w-auto cursor-pointer py-2.5"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {error && movies.length === 0 ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          {!isInitialLoad && visibleMovies.length === 0 && !hasMore && (
            <EmptyState
              icon={SearchX}
              title="No movies found"
              message={
                mode === 'search'
                  ? `Nothing matched “${query}”. Check the spelling or try a different title.`
                  : 'Try a different genre or sort order.'
              }
              action={
                <button type="button" onClick={clearAll} className="btn-primary">
                  Clear filters
                </button>
              }
            />
          )}

          <MovieGrid movies={visibleMovies} loading={loading} skeletonCount={isInitialLoad ? 18 : 6} />

          {/* Infinite scroll trigger */}
          <div ref={sentinelRef} className="h-10" aria-hidden="true" />

          {error && movies.length > 0 && (
            <div className="mt-4">
              <ErrorState message={error} onRetry={retry} compact />
            </div>
          )}

          {mode === 'search' && genreId && hasMore && !loading && visibleMovies.length < 6 && (
            <p className="mt-4 text-center text-sm text-muted">
              Only some results match this genre so far. More are loading as you scroll.
            </p>
          )}

          {!loading && !error && hasMore && (
            <div className="mt-4 text-center">
              <button type="button" onClick={loadMore} className="btn-ghost">
                Load more
              </button>
            </div>
          )}

          {!hasMore && !loading && movies.length > 0 && (
            <p className="mt-8 text-center text-sm text-muted">You have reached the end.</p>
          )}
        </>
      )}
    </div>
  );
}
